// POST /api/cohort/run — run or continue cohort scoring/dates/ranking (Agent B).
// One chunk per call (serverless-safe): ?phase=analyze|prescore|dates|rank,
// ?limit=N caps units of work this call. Idempotent — skips finished rows.
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { analyzePerson } from '@/lib/agents/analyze';
import { scorePairs, selectCandidates } from '@/lib/agents/prescore';
import { runDate } from '@/lib/agents/date';
import { buildRankings } from '@/lib/agents/rank';
import { createJob, updateJob, finishJob } from '@/app/api/_b';

export const maxDuration = 300;

export async function POST(req: Request) {
  const url = new URL(req.url);
  const phase = url.searchParams.get('phase') ?? 'all';
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '4', 10) || 4, 25);
  const topK = Math.min(parseInt(url.searchParams.get('topK') ?? '4', 10) || 4, 4);
  const jobId = await createJob(`cohort:${phase}`);
  try {
    const people = (await db()`SELECT id, name, status FROM people ORDER BY created_at ASC`) as unknown as {
      id: string;
      name: string;
      status: string;
    }[];
    const ids = people.map((p) => p.id);
    const out: Record<string, unknown> = { jobId, phase };

    if (phase === 'analyze' || phase === 'all') {
      const pending = people.filter((p) => p.status !== 'analyzed').slice(0, limit);
      const results: string[] = [];
      for (const p of pending) {
        try {
          await analyzePerson(p.id);
          results.push(p.id);
        } catch (e) {
          results.push(`${p.id}:FAILED ${(e as Error).message}`);
        }
        await updateJob(jobId, results.length / Math.max(1, pending.length));
      }
      out.analyzed = results;
      if (phase === 'analyze') {
        await finishJob(jobId);
        return NextResponse.json(out);
      }
    }

    if (phase === 'prescore' || phase === 'all') {
      out.prescore = await scorePairs(ids);
      await updateJob(jobId, 0.5);
      if (phase === 'prescore') {
        await finishJob(jobId);
        return NextResponse.json(out);
      }
    }

    if (phase === 'dates' || phase === 'all') {
      const allScores = (await db()`SELECT * FROM pair_scores`) as unknown as Parameters<
        typeof selectCandidates
      >[1];
      const pairs = selectCandidates(ids, allScores, topK);
      const existing = new Set(
        ((await db()`SELECT a_id, b_id FROM dates`) as unknown as { a_id: string; b_id: string }[]).map((d) =>
          [d.a_id, d.b_id].sort().join('::'),
        ),
      );
      const todo = pairs.filter((p) => !existing.has([p.aId, p.bId].sort().join('::'))).slice(0, limit);
      const ran: string[] = [];
      for (const p of todo) {
        try {
          await runDate(p.aId, p.bId);
          ran.push(`${p.aId.slice(0, 8)}x${p.bId.slice(0, 8)}`);
        } catch (e) {
          ran.push(`FAILED ${(e as Error).message}`);
        }
      }
      out.dates = ran;
      await updateJob(jobId, 0.8);
      if (phase === 'dates') {
        await finishJob(jobId);
        return NextResponse.json(out);
      }
    }

    out.ranked = await buildRankings(ids);
    await finishJob(jobId);
    return NextResponse.json(out);
  } catch (e) {
    await finishJob(jobId, (e as Error).message);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
