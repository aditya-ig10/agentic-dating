/**
 * lib/agents/prescore.ts — scorePairs + candidate selection (Agent B owns).
 *
 * Batched compatibility pre-score: ONE llmJson call per person scores ALL
 * other candidates in a single JSON array (~25 calls for 25 people, not 300).
 * Results expand into PairScore rows cached in pair_scores; already-cached
 * candidates are excluded from the batch (resumable, never re-scored).
 * Then top-K candidate selection per person with symmetric dedupe:
 * date(A,B) runs once even if both rank each other.
 */
import { llmJson } from '../llm';
import { db } from '../db/client';
import { getProfile } from '../db/people';
import type { Analysis, PairScore } from '../types';

export interface BatchScoreItem {
  id: string;
  score: number;
  reason: string;
}

const BATCH_PRESCORE_SCHEMA = `{ scores: [{ id: string, score: 0-100, reason: string }] }`;

function compactLine(tag: string, x: Analysis): string {
  return `${tag}: ${x.headline} — ${x.summary} Wants: ${x.partner_wants.join('; ')} Dealbreakers: ${x.dealbreakers.join('; ')}`;
}

function buildBatchPrescorePrompt(me: Analysis, others: Array<{ id: string; analysis: Analysis }>): string {
  const cands = others.map((o) => compactLine(`[${o.id}]`, o.analysis)).join('\n');
  return `You are a dating compatibility pre-screener. Score how well EACH candidate below fits ME as a dating partner. Output STRICT JSON { scores: [{ id, score, reason }] } — nothing else.
Score shared interests AND complementary needs; penalize dealbreaker clashes hard.
reason: one sentence naming the strongest match point or clash for that candidate.
Cover every candidate id exactly once. Keep it fast and decisive. Forbidden: never mention religion, sexual orientation, health, politics, ethnicity, caste.

ME: ${me.headline} — ${me.summary} Wants: ${me.partner_wants.join('; ')} Dealbreakers: ${me.dealbreakers.join('; ')}

CANDIDATES:
${cands}
JSON only.

Respond with JSON matching this shape (no other text):
${BATCH_PRESCORE_SCHEMA}`;
}

function pairKey(aId: string, bId: string): string {
  return [aId, bId].sort().join('::');
}

/** Test seam. */
export const __test = { buildBatchPrescorePrompt, pairKey };

export interface PrescoreDeps {
  /** All person ids in the cohort. */
  cohortIds: string[];
  /** Load a person's saved analysis. Defaults to profiles table. */
  getAnalysis?: (id: string) => Promise<Analysis | null>;
  /** Load a cached score; null if unscored. Keyed unordered. Defaults to pair_scores. */
  getCached?: (aId: string, bId: string) => Promise<PairScore | null>;
  /** Persist fresh scores. Defaults to pair_scores upsert. */
  saveScores?: (rows: PairScore[]) => Promise<void>;
  /** Optional LLM override for tests (defaults to llmJson). */
  json?: <T>(prompt: string, schema: string) => Promise<T>;
}

/** Score every pair in the cohort; skips pairs already cached (resumable). */
export async function scorePairs(
  cohortIdsOrDeps: string[] | PrescoreDeps,
): Promise<{ scored: number; skipped: number; calls: number }> {
  const deps: PrescoreDeps = Array.isArray(cohortIdsOrDeps) ? { cohortIds: cohortIdsOrDeps } : cohortIdsOrDeps;
  const { cohortIds } = deps;
  const getAnalysis =
    deps.getAnalysis ??
    (async (id: string) => (await getProfile(id))?.analysis ?? null);
  const getCached =
    deps.getCached ??
    (async (aId: string, bId: string) => {
      const rows = await db()`
        SELECT * FROM pair_scores
        WHERE (a_id = ${aId} AND b_id = ${bId}) OR (a_id = ${bId} AND b_id = ${aId}) LIMIT 1`;
      return ((rows as unknown[])[0] as PairScore | undefined) ?? null;
    });
  const saveScores =
    deps.saveScores ??
    (async (rows: PairScore[]) => {
      for (const r of rows) {
        await db()`
          INSERT INTO pair_scores (a_id, b_id, score, reason)
          VALUES (${r.a_id}, ${r.b_id}, ${r.score}, ${r.reason})
          ON CONFLICT (a_id, b_id) DO UPDATE SET score = ${r.score}, reason = ${r.reason}`;
      }
    });
  const callJson = deps.json ?? (<T>(p: string, s: string) =>
    llmJson<T>(p, s, { purpose: 'prescore', maxOutputTokens: 4096, temperature: 0.5 }));
  const analyses = new Map<string, Analysis>();
  for (const id of cohortIds) {
    const a = await getAnalysis(id);
    if (a) analyses.set(id, a);
  }
  let scored = 0;
  let skipped = 0;
  let calls = 0;
  for (const me of cohortIds) {
    const my = analyses.get(me);
    if (!my) continue;
    // Exclude already-cached candidates so a re-run only scores what's missing.
    const todo: Array<{ id: string; analysis: Analysis }> = [];
    for (const them of cohortIds) {
      if (them === me) continue;
      const other = analyses.get(them);
      if (!other) {
        skipped += 1;
        continue;
      }
      if (await getCached(me, them)) {
        skipped += 1;
        continue;
      }
      todo.push({ id: them, analysis: other });
    }
    if (todo.length === 0) continue;
    const res = await callJson<{ scores: BatchScoreItem[] }>(
      buildBatchPrescorePrompt(my, todo),
      BATCH_PRESCORE_SCHEMA,
    );
    calls += 1;
    const byId = new Map((res.scores ?? []).map((s) => [s.id, s]));
    const rows: PairScore[] = [];
    for (const t of todo) {
      const s = byId.get(t.id);
      const score =
        s && typeof s.score === 'number' ? Math.min(100, Math.max(0, Math.round(s.score))) : 50;
      rows.push({ a_id: me, b_id: t.id, score, reason: String(s?.reason ?? 'no reason given').slice(0, 300) });
    }
    await saveScores(rows);
    scored += rows.length;
  }
  return { scored, skipped, calls };
}

/**
 * Top-K candidates per person from pair_scores.
 * Returns unique unordered pairs to actually date (symmetric dedupe).
 */
export function selectCandidates(
  personIds: string[],
  scores: PairScore[],
  topK = 4,
): Array<{ aId: string; bId: string }> {
  const byPerson = new Map<string, PairScore[]>();
  for (const id of personIds) byPerson.set(id, []);
  for (const s of scores) {
    byPerson.get(s.a_id)?.push(s);
    // Mirror so lookup from B's side works too.
    byPerson.get(s.b_id)?.push({ a_id: s.b_id, b_id: s.a_id, score: s.score, reason: s.reason });
  }
  const picked = new Set<string>();
  const out: Array<{ aId: string; bId: string }> = [];
  for (const id of personIds) {
    const ranked = (byPerson.get(id) ?? []).sort((x, y) => y.score - x.score).slice(0, topK);
    for (const r of ranked) {
      const key = pairKey(id, r.b_id);
      if (picked.has(key)) continue;
      picked.add(key);
      const [aId, bId] = [id, r.b_id].sort();
      out.push({ aId, bId });
    }
  }
  return out;
}
