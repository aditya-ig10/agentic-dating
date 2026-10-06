/**
 * lib/agents/rank.ts — buildRankings + matchNewPerson (Agent B owns).
 *
 * Ranking is deterministic (no LLM): final = 0.7 * mean(date verdicts) +
 * 0.3 * prescore. People never dated rank below dated ones, ordered by
 * prescore. `why` blends the verdict note + prescore reason.
 */
import type { PairScore, RankingEntry as DbRankingEntry, Verdict } from '../types';
import { db } from '../db/client';

export interface RankRow {
  personId: string;
  candidateId: string;
  rank: number;
  finalScore: number;
  why: string;
  dated: boolean;
}

export interface RankDeps {
  personIds: string[];
  /** All prescores touching these people (unordered pairs). Defaults to pair_scores. */
  pairScores?: PairScore[];
  /** Verdicts with the other party attached. Defaults to verdicts table. */
  verdicts?: Array<{ fromPersonId: string; otherPersonId: string; score: number; note: string }>;
  /** personId -> display name (for `why` text). Defaults to people table. */
  names?: Map<string, string>;
  /** Persist rows. Defaults to rankings upsert. */
  saveRankings?: (rows: RankRow[]) => Promise<void>;
}

function mean(xs: number[]): number | null {
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function buildRankingEntries(deps: RankDeps & Required<Pick<RankDeps, 'pairScores' | 'verdicts' | 'names'>>): RankRow[] {
  const { personIds, pairScores, verdicts, names } = deps;
  const prescore = new Map<string, PairScore>();
  for (const s of pairScores) {
    // Keep direction as stored; lookup handles both orders.
    prescore.set(`${s.a_id}::${s.b_id}`, s);
  }
  const prescoreOf = (a: string, b: string): PairScore | undefined =>
    prescore.get(`${a}::${b}`) ?? prescore.get(`${b}::${a}`);

  const out: RankRow[] = [];
  for (const me of personIds) {
    const rows: Array<Omit<RankRow, 'rank'> & { sortKey: number[] }> = [];
    for (const them of personIds) {
      if (them === me) continue;
      const ps = prescoreOf(me, them);
      const pre = ps?.score ?? 50;
      // Only my own verdicts count toward MY ranking: filter by fromPersonId.
      const myScores = verdicts
        .filter((v) => v.fromPersonId === me && v.otherPersonId === them)
        .map((v) => v.score);
      const myMean = mean(myScores);
      const dated = myScores.length > 0;
      const final = dated ? Math.round(0.7 * (myMean as number) + 0.3 * pre) : Math.round(pre);
      const themName = names.get(them) ?? 'them';
      const myNote = verdicts.find((v) => v.fromPersonId === me && v.otherPersonId === them)?.note;
      const why = dated
        ? `Dated ${themName} (date score ${Math.round(myMean as number)}): “${myNote ?? 'no note'}” Pre-screen fit ${pre}/100${ps?.reason ? ` — ${ps.reason}` : ''}.`
        : `Not yet dated. Pre-screen fit ${pre}/100${ps?.reason ? `: ${ps.reason}` : ''}. Date ${themName} to refine this.`;
      rows.push({
        personId: me,
        candidateId: them,
        finalScore: final,
        why: why.slice(0, 500),
        dated,
        sortKey: [dated ? 0 : 1, -final],
      });
    }
    rows.sort((x, y) => x.sortKey[0] - y.sortKey[0] || x.sortKey[1] - y.sortKey[1]);
    rows.forEach((r, i) => out.push({ ...r, rank: i + 1 }));
  }
  return out;
}

/** Test seam. */
export const __test = { buildRankingEntries, mean };

/**
 * AGENDA §4 buildRankings: load pair_scores + verdicts + names from the DB,
 * compute entries, upsert into rankings. Returns row count.
 */
export async function buildRankings(personIds: string[], deps: Omit<RankDeps, 'personIds'> = {}): Promise<number> {
  const pairScores =
    deps.pairScores ??
    ((await db()`SELECT * FROM pair_scores`) as unknown as PairScore[]);
  const verdictRows =
    deps.verdicts ??
    ((await db()`
      SELECT v.from_person_id AS "fromPersonId", v.score, v.note,
             CASE WHEN d.a_id = v.from_person_id THEN d.b_id ELSE d.a_id END AS "otherPersonId"
      FROM verdicts v JOIN dates d ON d.id = v.date_id`) as unknown as Array<{
      fromPersonId: string;
      otherPersonId: string;
      score: number;
      note: string;
    }>);
  const names =
    deps.names ??
    new Map(
      ((await db()`SELECT id, name FROM people`) as unknown as { id: string; name: string }[]).map((p) => [
        p.id,
        p.name,
      ]),
    );
  const entries = buildRankingEntries({ personIds, pairScores, verdicts: verdictRows, names });
  const save =
    deps.saveRankings ??
    (async (rows: RankRow[]) => {
      for (const r of rows) {
        await db()`
          INSERT INTO rankings (person_id, candidate_id, rank, final_score, why)
          VALUES (${r.personId}, ${r.candidateId}, ${r.rank}, ${r.finalScore}, ${r.why})
          ON CONFLICT (person_id, candidate_id) DO UPDATE SET
            rank = ${r.rank}, final_score = ${r.finalScore}, why = ${r.why}`;
      }
    });
  await save(entries);
  return entries.length;
}

/** Keep the DB row shape import referenced for API-route consumers. */
export type { DbRankingEntry };
