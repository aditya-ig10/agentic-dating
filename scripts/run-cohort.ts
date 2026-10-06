/**
 * scripts/run-cohort.ts — resumable local cohort run (Agent B owns).
 *
 * Phases: analyze (pending -> analyzed) -> prescore (all pairs, batched) ->
 * dates (top-K per person, symmetric dedupe, skips existing) -> rankings.
 *
 * Idempotent: every phase skips work already in the DB, so re-running is
 * safe and resumes where it left off. Prints LLM usage counters at the end.
 *
 * Usage:
 *   npx tsx scripts/run-cohort.ts [--limit N] [--topK K] [--dry]
 *   --limit N  only process first N people (default: all)
 *   --topK K   dates per person (default 4, agenda allows 3-4)
 *   --dry      print the plan without calling the LLM or writing
 *
 * Env: DATABASE_URL, GEMINI_API_KEY, GEMINI_MODEL (via lib/llm.ts).
 */
import { db } from '../lib/db/client';
import { getLlmUsage } from '../lib/llm';
import { analyzePerson } from '../lib/agents/analyze';
import { scorePairs, selectCandidates } from '../lib/agents/prescore';
import { runDate } from '../lib/agents/date';
import { buildRankings } from '../lib/agents/rank';

function args(): { limit: number; topK: number; dry: boolean } {
  const out = { limit: Infinity, topK: 4, dry: false };
  for (const a of process.argv.slice(2)) {
    if (a === '--dry') out.dry = true;
    else if (a.startsWith('--limit=')) out.limit = parseInt(a.split('=')[1], 10) || Infinity;
    else if (a.startsWith('--topK=')) out.topK = parseInt(a.split('=')[1], 10) || 4;
  }
  return out;
}

async function main(): Promise<void> {
  const { limit, topK, dry } = args();
  const sql = db();
  const people = (await sql`
    SELECT id, name, status FROM people ORDER BY created_at ASC LIMIT ${Number.isFinite(limit) ? limit : 1000000}
  `) as unknown as { id: string; name: string; status: string }[];
  const ids = people.map((p) => p.id);
  console.log(`cohort: ${ids.length} people (limit=${Number.isFinite(limit) ? limit : 'all'}, topK=${topK}${dry ? ', DRY' : ''})`);

  // Phase 1: analyze anyone not yet analyzed.
  const pending = people.filter((p) => p.status !== 'analyzed');
  console.log(`phase 1 analyze: ${pending.length} pending`);
  if (!dry) {
    for (const p of pending) {
      try {
        const a = await analyzePerson(p.id);
        console.log(`  analyzed ${p.name} (confidence ${a.confidence.toFixed(2)})`);
      } catch (e) {
        console.log(`  FAILED ${p.name}: ${(e as Error).message}`);
      }
    }
  }

  // Phase 2: batched prescore (~1 LLM call per person).
  console.log('phase 2 prescore');
  if (!dry) {
    const r = await scorePairs(ids);
    console.log(`  scored=${r.scored} skipped=${r.skipped} calls=${r.calls}`);
  }

  // Phase 3: dates for top-K candidates per person (skip pairs already dated).
  const pairRows = (await sql`SELECT a_id, b_id FROM pair_scores`) as unknown as {
    a_id: string;
    b_id: string;
  }[];
  // Rebuild scores with reasons for selection (need full rows).
  const fullScores = (await sql`SELECT * FROM pair_scores`) as unknown as Parameters<
    typeof selectCandidates
  >[1];
  const pairs = selectCandidates(ids, fullScores, topK);
  const existing = new Set(
    (
      (await sql`SELECT a_id, b_id FROM dates`) as unknown as { a_id: string; b_id: string }[]
    ).map((d) => [d.a_id, d.b_id].sort().join('::')),
  );
  const todo = pairs.filter((p) => !existing.has([p.aId, p.bId].sort().join('::')));
  console.log(`phase 3 dates: ${pairs.length} pairs selected, ${todo.length} to run`);
  void pairRows;
  if (!dry) {
    for (const p of todo) {
      try {
        const res = await runDate(p.aId, p.bId);
        console.log(`  date ${p.aId.slice(0, 8)} x ${p.bId.slice(0, 8)}: ${res.transcript.length} turns, scores ${res.verdicts.map((v) => v.score).join('/')}`);
      } catch (e) {
        console.log(`  DATE FAILED ${p.aId.slice(0, 8)} x ${p.bId.slice(0, 8)}: ${(e as Error).message}`);
      }
    }
  }

  // Phase 4: rankings for everyone.
  console.log('phase 4 rankings');
  if (!dry) {
    const n = await buildRankings(ids);
    console.log(`  wrote ${n} ranking rows`);
  }

  console.log('LLM usage:', JSON.stringify(getLlmUsage()));
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
