/**
 * lib/llm.ts — Gemini-only LLM transport (Agent B owns).
 *
 * Zero dependencies: plain `fetch` against the Gemini REST API
 * (generativelanguage.googleapis.com/v1beta). Works in API routes,
 * local scripts, and before `npm install` exists.
 *
 * Features:
 *  - `llmJson(prompt, schema)` — strict-JSON generation, parses and returns T.
 *  - `llmChat(messages, opts)` — free-text multi-turn generation.
 *  - Retry with exponential backoff + jitter on 429/5xx, honoring
 *    the server's `Retry-After` header.
 *  - Concurrency cap + minimum spacing between request starts, so the
 *    free tier is never hammered (tune via env).
 *  - In-memory per-purpose call counters (`getLlmUsage`) so
 *    scripts/run-cohort.ts can report "LLM calls per date".
 *
 * Env: GEMINI_API_KEY (required), GEMINI_MODEL (default gemini-3.5-flash-lite),
 *      LLM_MAX_CONCURRENT (default 2), LLM_MIN_INTERVAL_MS (default 2000),
 *      LLM_MAX_RETRIES (default 6).
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmCallOptions {
  /** Cap on output tokens. Defaults per call type. */
  maxOutputTokens?: number;
  /** 0..2. Defaults: 0.7 for JSON, 0.9 for chat (dates need spark). */
  temperature?: number;
  /** Label for usage accounting, e.g. "analysis", "prescore", "date-turn", "verdict". */
  purpose?: string;
  /** Abort timeout per attempt. Default 90s. */
  timeoutMs?: number;
}

export class LlmError extends Error {
  status?: number;
  retryable: boolean;
  constructor(message: string, opts: { status?: number; retryable?: boolean } = {}) {
    super(message);
    this.name = 'LlmError';
    this.status = opts.status;
    this.retryable = opts.retryable ?? false;
  }
}

// ---------------------------------------------------------------- config

function envInt(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function config() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new LlmError('GEMINI_API_KEY is not set', { retryable: false });
  return {
    apiKey,
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    maxConcurrent: envInt('LLM_MAX_CONCURRENT', 2),
    minIntervalMs: envInt('LLM_MIN_INTERVAL_MS', 2000),
    maxRetries: envInt('LLM_MAX_RETRIES', 6),
  };
}

// ---------------------------------------------------------- rate limiting

let inFlight = 0;
const waitQueue: Array<() => void> = [];
let lastStartAt = 0;

async function acquireSlot(minIntervalMs: number, maxConcurrent: number): Promise<void> {
  // Wait for a free concurrency slot.
  while (inFlight >= maxConcurrent) {
    await new Promise<void>((resolve) => waitQueue.push(resolve));
  }
  // Enforce minimum spacing between request starts.
  const now = Date.now();
  const wait = lastStartAt + minIntervalMs - now;
  if (wait > 0) await sleep(wait);
  // Re-check slot after sleeping (another caller may have taken it).
  if (inFlight >= maxConcurrent) {
    await new Promise<void>((resolve) => waitQueue.push(resolve));
  }
  inFlight += 1;
  lastStartAt = Date.now();
}

function releaseSlot(): void {
  inFlight = Math.max(0, inFlight - 1);
  const next = waitQueue.shift();
  if (next) next();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------- usage

const usageCounts = new Map<string, number>();

function recordCall(purpose: string): void {
  usageCounts.set(purpose, (usageCounts.get(purpose) ?? 0) + 1);
}

/** Snapshot of LLM calls made in this process, keyed by purpose. */
export function getLlmUsage(): Record<string, number> {
  return Object.fromEntries(usageCounts);
}

export function resetLlmUsage(): void {
  usageCounts.clear();
}

// ----------------------------------------------------------------- core

function toGeminiContents(messages: ChatMessage[]): {
  systemInstruction?: { parts: Array<{ text: string }> };
  contents: Array<{ role: string; parts: Array<{ text: string }> }>;
} {
  const systemParts: string[] = [];
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  for (const m of messages) {
    if (m.role === 'system') {
      systemParts.push(m.content);
    } else {
      contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] });
    }
  }
  // Gemini requires at least one content part; a system-only call still needs a nudge.
  if (contents.length === 0) contents.push({ role: 'user', parts: [{ text: 'Go.' }] });
  return {
    systemInstruction: systemParts.length > 0 ? { parts: [{ text: systemParts.join('\n\n') }] } : undefined,
    contents,
  };
}

function extractJson(raw: string): string {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fence ? fence[1] : raw).trim();
  // Tolerate leading/trailing prose: slice from first { or [ to last } or ].
  const start = candidate.search(/[{[]/);
  if (start > 0) {
    const endJson = candidate.lastIndexOf('}');
    const endArr = candidate.lastIndexOf(']');
    const end = Math.max(endJson, endArr);
    if (end > start) return candidate.slice(start, end + 1);
  }
  return candidate;
}

function retryAfterMs(res: Response, attempt: number): number {
  const header = res.headers.get('retry-after');
  if (header) {
    const secs = parseFloat(header);
    if (Number.isFinite(secs)) return Math.max(0, secs * 1000);
  }
  // Exponential backoff with jitter: 2s, 4s, 8s, ... capped at 60s.
  const base = Math.min(2000 * 2 ** attempt, 60000);
  return base + Math.random() * 1000;
}

async function generateOnce(
  apiKey: string,
  model: string,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal },
    );
  } finally {
    clearTimeout(timer);
  }
}

function readText(res: unknown): string {
  const cands = (res as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })?.candidates;
  if (!cands || cands.length === 0) throw new LlmError('Gemini returned no candidates', { retryable: true });
  const text = (cands[0].content?.parts ?? []).map((p) => p.text ?? '').join('');
  if (!text) {
    const reason = (cands[0] as { finishReason?: string }).finishReason ?? 'unknown';
    throw new LlmError(`Gemini returned empty text (finishReason=${reason})`, { retryable: true });
  }
  return text;
}

async function callGemini(messages: ChatMessage[], jsonMode: boolean, opts: LlmCallOptions): Promise<string> {
  const cfg = config();
  const { systemInstruction, contents } = toGeminiContents(messages);
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: opts.temperature ?? (jsonMode ? 0.7 : 0.9),
      maxOutputTokens: opts.maxOutputTokens ?? (jsonMode ? 4096 : 512),
      ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  };
  if (systemInstruction) body.systemInstruction = systemInstruction;

  await acquireSlot(cfg.minIntervalMs, cfg.maxConcurrent);
  try {
    let lastErr: unknown = null;
    for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
      if (attempt > 0) recordCall(`${opts.purpose ?? 'llm'}:retry`);
      let res: Response;
      try {
        res = await generateOnce(cfg.apiKey, cfg.model, body, opts.timeoutMs ?? 90000);
      } catch (e) {
        lastErr = e instanceof Error && e.name === 'AbortError'
          ? new LlmError('Gemini request timed out', { retryable: true })
          : e;
        await sleep(retryAfterMs(new Response(), attempt));
        continue;
      }
      if (res.ok) {
        const data: unknown = await res.json();
        recordCall(opts.purpose ?? 'llm');
        return readText(data);
      }
      const status = res.status;
      const errText = await res.text().catch(() => '');
      const retryable = status === 429 || status >= 500;
      lastErr = new LlmError(`Gemini error ${status}: ${errText.slice(0, 300)}`, { status, retryable });
      if (!retryable || attempt === cfg.maxRetries) break;
      await sleep(retryAfterMs(res, attempt));
    }
    throw lastErr instanceof Error ? lastErr : new LlmError(String(lastErr), { retryable: false });
  } finally {
    releaseSlot();
  }
}

// ------------------------------------------------------------------ api

/**
 * Ask the LLM for structured JSON. `schemaHint` is a short description of the
 * expected shape (a TS type literal works well) embedded in the prompt; the
 * response is parsed and returned as T. Throws LlmError on parse failure.
 */
export async function llmJson<T = unknown>(
  prompt: string,
  schemaHint?: string,
  opts: LlmCallOptions = {},
): Promise<T> {
  const full = schemaHint
    ? `${prompt}\n\nRespond with JSON matching this shape (no other text):\n${schemaHint}`
    : prompt;
  const text = await callGemini([{ role: 'user', content: full }], true, opts);
  try {
    return JSON.parse(extractJson(text)) as T;
  } catch {
    throw new LlmError(`LLM did not return valid JSON: ${text.slice(0, 300)}`, { retryable: true });
  }
}

/** Free-text generation over a system/user/assistant message list. */
export async function llmChat(messages: ChatMessage[], opts: LlmCallOptions = {}): Promise<string> {
  return (await callGemini(messages, false, opts)).trim();
}
