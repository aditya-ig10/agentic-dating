/**
 * lib/agents/rank.ts — buildRankings + matchNewPerson (Agent B owns).
 *
 * Ranking is deterministic (no LLM): final = 0.7 * mean(date verdicts) +
 * 0.3 * prescore. People never dated rank below dated ones, ordered by
 * prescore. `why` blends the verdict note + prescore reason.
 */
import type { Verdict } from './date';
import type { PairScore } from './prescore';

export interface RankingEntry {
  personId: string;
  candidateId: string;
  rank: number;
  finalScore: number;
  why: string;
  dated: boolean;
}

export interface RankDeps {
  personIds: string[];
  /** All prescores touching these people (unordered pairs). */
  pairScores: PairScore[];
  /** Verdicts from dates involving one of these people. */
  verdicts: Array<Verdict & { otherPersonId: string }>;
  /** personId -> display name (for `why` text). */
  names: Map<string, string>;
}

function mean(xs: number[]): number | null {
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function buildRankingEntries(deps: RankDeps): RankingEntry[] {
  const { personIds, pairScores, verdicts, names } = deps;
  const prescore = new Map<string, PairScore>();
  for (const s of pairScores) {
    // Keep direction as stored; lookup handles both orders.
    prescore.set(`${s.aId}::${s.bId}`, s);
  }
  const prescoreOf = (a: string, b: string): PairScore | undefined =>
    prescore.get(`${a}::${b}`) ?? prescore.get(`${b}::${a}`);

  const out: RankingEntry[] = [];
  for (const me of personIds) {
    const rows: Array<Omit<RankingEntry, 'rank'> & { sortKey: number[] }> = [];
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
