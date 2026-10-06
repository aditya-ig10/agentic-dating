// POST /api/match/:id — match a NEW person against the cohort (Agent B).
// Expects person already ingested + analyzed. Runs: prescore vs cohort,
// top-3 dates, then rankings for this person. One unit of work per call —
// the client polls and re-calls until done (idempotent, skips finished).
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { getPerson, getProfile } from '@/lib/db/people';
import { scorePairs, selectCandidates } from '@/lib/agents/prescore';
import { runDate } from '@/lib/agents/date';
import { buildRankings } from '@/lib/agents/rank';
import { createJob, updateJob, finishJob } from '@/app/api/_b';

export const maxDuration = 300;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) return NextResponse.json({ error: 'person not found' }, { status: 404 });
  if (!(await getProfile(id))) {
    return NextResponse.json({ error: 'person not analyzed yet — ingest first' }, { status: 400 });
  }
  const jobId = await createJob(`match:${id}`);
  try {
    const cohort = (await db()`SELECT id FROM people WHERE id != ${id}`) as unknown as { id: string }[];
    const cohortIds = [id, ...cohort.map((c) => c.id)];

    await scorePairs(cohortIds);
    await updateJob(jobId, 0.3);

    const allScores = (await db()`SELECT * FROM pair_scores`) as unknown as Parameters<typeof selectCandidates>[1];
    const mine = allScores.filter((s) => s.a_id === id || s.b_id === id);
    const myTop = selectCandidates([id, ...cohort.map((c) => c.id)], mine, 3);
    const existing = new Set(
      ((await db()`SELECT a_id, b_id FROM dates WHERE a_id = ${id} OR b_id = ${id}`) as unknown as {
        a_id: string;
        b_id: string;
      }[]).map((d) => [d.a_id, d.b_id].sort().join('::')),
    );
    let done = 0;
    for (const p of myTop) {
      if (existing.has([p.aId, p.bId].sort().join('::'))) continue;
      await runDate(p.aId, p.bId);
      done += 1;
      await updateJob(jobId, 0.3 + (0.6 * done) / Math.max(1, myTop.length));
    }

    await buildRankings(cohortIds);
    await finishJob(jobId);
    return NextResponse.json({ jobId, datesRun: done });
  } catch (e) {
    await finishJob(jobId, (e as Error).message);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
