/**
 * lib/agents/analyze.ts — analyzePerson (Agent B owns).
 *
 * Reads raw_scrapes (linkedin + instagram payloads) for a person, asks Gemini
 * for the structured Analysis JSON per AGENDA §4, validates it, and persists
 * via saveProfile (Agent A). Retries once on invalid JSON, else throws.
 *
 * NOTE: imports `../db` and `../types` — these land with Agent A's scaffold.
 * This file is written against the AGENDA §4 contracts and has not been
 * compiled yet (STATUS: waiting on scaffold).
 */
import { llmJson, LlmError } from '../llm';
// Agent A provides: import { getRawScrapes, saveProfile } from '../db';
// Agent A provides: import type { Analysis } from '../types';

export interface EvidenceClaim {
  text: string;
  evidence: string;
}

export interface Analysis {
  headline: string;
  summary: string;
  needs: EvidenceClaim[];
  hobbies: EvidenceClaim[];
  interests: EvidenceClaim[];
  values: EvidenceClaim[];
  personality: EvidenceClaim[];
  communication_style: string;
  partner_wants: string[];
  dealbreakers: string[];
  confidence: number;
  data_gaps: string[];
}

const ANALYSIS_SCHEMA = `{
  headline: string,
  summary: string,
  needs: [{ text, evidence }],
  hobbies: [{ text, evidence }],
  interests: [{ text, evidence }],
  values: [{ text, evidence }],
  personality: [{ text, evidence }],
  communication_style: string,
  partner_wants: [string],
  dealbreakers: [string],
  confidence: number,
  data_gaps: [string]
}`;

const FORBIDDEN_RE = /religion|sexual orientation|gay|lesbian|bisexual|transgender|hiv|cancer|diabet|politic|republican|democrat|bjp|congress|ethnic|caste|brahmin|dalit/i;

function buildAnalysisPrompt(name: string, linkedin: string, instagram: string): string {
  return `You profile a person for a dating site from ONLY their public LinkedIn and Instagram data below. Output STRICT JSON matching the shape given — no other text.

Rules:
- Every claim in needs/hobbies/interests/values/personality MUST have a short evidence quote (<=140 chars) copied or closely paraphrased from the source data.
- Evidence never invents posts, jobs, or trips. If the data is thin, say so in data_gaps and LOWER confidence. Never fill gaps with guesses.
- FORBIDDEN: do not infer or mention religion, sexual orientation, health, politics, ethnicity, or caste — of this person or anyone else. If such a topic appears in the source, ignore it for the profile.
- partner_wants: 3-6 concrete traits (not "nice person"). dealbreakers: 2-4.
- communication_style: 1-2 sentences on how they come across in writing.
- confidence: 0..1 reflecting source richness (both sources rich ~0.8+, one source thin ~0.4-0.6, almost nothing <0.4).

LINKEDIN (public profile + posts, verbatim from scraper):
${linkedin || '(no LinkedIn data — source failed or was empty)'}

INSTAGRAM (public bio + recent captions, verbatim from scraper):
${instagram || '(no Instagram data — source failed or was empty)'}

Person's stated name (if given): ${name || '(unknown)'}

Respond with JSON matching this shape (no other text):
${ANALYSIS_SCHEMA}`;
}

function sanitize(a: Analysis): Analysis {
  const clean = (s: string) => (typeof s === 'string' ? s.slice(0, 500) : '');
  const cleanClaims = (list: unknown): EvidenceClaim[] =>
    Array.isArray(list)
      ? list
          .filter((c) => c && typeof (c as EvidenceClaim).text === 'string')
          .map((c) => ({
            text: clean((c as EvidenceClaim).text).slice(0, 200),
            evidence: clean((c as EvidenceClaim).evidence ?? '').slice(0, 200),
          }))
          .slice(0, 10)
      : [];
  const cleanStrs = (list: unknown): string[] =>
    Array.isArray(list)
      ? list.filter((s) => typeof s === 'string').map((s) => s.slice(0, 200)).slice(0, 10)
      : [];
  return {
    headline: clean(a.headline).slice(0, 120),
    summary: clean(a.summary).slice(0, 1500),
    needs: cleanClaims(a.needs),
    hobbies: cleanClaims(a.hobbies),
    interests: cleanClaims(a.interests),
    values: cleanClaims(a.values),
    personality: cleanClaims(a.personality),
    communication_style: clean(a.communication_style).slice(0, 500),
    partner_wants: cleanStrs(a.partner_wants),
    dealbreakers: cleanStrs(a.dealbreakers),
    confidence: typeof a.confidence === 'number' ? Math.min(1, Math.max(0, a.confidence)) : 0.3,
    data_gaps: cleanStrs(a.data_gaps),
  };
}

function validate(a: Analysis): string[] {
  const missing: string[] = [];
  if (!a.headline) missing.push('headline');
  if (!a.summary) missing.push('summary');
  if (!a.communication_style) missing.push('communication_style');
  if (!Array.isArray(a.partner_wants) || a.partner_wants.length === 0) missing.push('partner_wants');
  const joined = JSON.stringify(a);
  if (FORBIDDEN_RE.test(joined)) missing.push('forbidden-attribute-leak');
  return missing;
}

/** Test seam: pure prompt builder + validator (no DB/LLM). */
export const __test = { buildAnalysisPrompt, sanitize, validate };

/**
 * Full pipeline step. Wired to Agent A's db functions once the scaffold lands:
 *   getRawScrapes(personId) -> { linkedin: string; instagram: string; name: string }
 *   saveProfile(personId, analysis, summary)
 */
export async function analyzePerson(
  personId: string,
  deps: {
    getRaw: (id: string) => Promise<{ name: string; linkedin: string; instagram: string }>;
    save: (id: string, analysis: Analysis, summary: string) => Promise<void>;
    json?: <T>(prompt: string, schema: string) => Promise<T>;
  },
): Promise<Analysis> {
  const { name, linkedin, instagram } = await deps.getRaw(personId);
  const callJson = deps.json ?? (<T>(p: string, s: string) =>
    llmJson<T>(p, s, { purpose: 'analysis', maxOutputTokens: 4096, temperature: 0.6 }));
  const prompt = buildAnalysisPrompt(name, linkedin, instagram);
  let raw: Analysis | null = null;
  let problems: string[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const p =
      attempt === 0
        ? prompt
        : `${prompt}\n\nYour last reply had these problems: ${problems.join(', ')}. Return ONLY the corrected JSON.`;
    try {
      raw = await callJson<Analysis>(p, ANALYSIS_SCHEMA);
    } catch (e) {
      if (e instanceof LlmError && attempt === 0) {
        problems = ['invalid-json'];
        continue;
      }
      throw e;
    }
    const clean = sanitize(raw);
    problems = validate(clean);
    if (problems.length === 0) {
      await deps.save(personId, clean, clean.summary);
      return clean;
    }
  }
  throw new LlmError(`analyzePerson failed validation: ${problems.join(', ')}`, { retryable: false });
}
