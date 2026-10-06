// RankingList — leaderboard podium rows. has_date is derived by the page
// from the person's dates list (ranking rows carry no date info themselves).
import type { RankingEntry } from "@/lib/types";

export interface RankedRow extends RankingEntry {
  candidate_name: string;
  has_date: boolean;
  date_id?: string;
}

export default function RankingList({ rows }: { rows: RankedRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="border-2 border-dashed border-bone/40 p-6 text-bone/70">
        The leaderboard is empty — scores land here once the dates wrap up.
      </p>
    );
  }
  return (
    <ol className="space-y-4">
      {rows.map((r, i) => (
        <li
          key={r.candidate_id}
          className={`pop-sm flex gap-4 border-2 border-ink bg-bone p-4 text-ink sm:p-5 ${
            i % 2 ? "rotate-[0.5deg]" : "-rotate-[0.5deg]"
          } ${r.rank === 1 ? "bg-gold" : ""}`}
        >
          <p
            className="font-display w-10 shrink-0 text-5xl leading-none"
            aria-label={`Rank ${r.rank}`}
          >
            {r.rank}
          </p>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg uppercase">{r.candidate_name}</p>
              {!r.has_date && (
                <span className="border border-ink bg-ink px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-bone">
                  Pre-score only
                </span>
              )}
            </div>
            <div
              className="mt-2 flex items-center gap-2"
              role="img"
              aria-label={`Final score ${r.final_score} out of 100`}
            >
              <div className="h-3 w-40 overflow-hidden border border-ink bg-white">
                <div
                  className={`h-full ${r.has_date ? "bg-hot" : "bg-ink/60"}`}
                  style={{ width: `${Math.min(100, Math.max(0, r.final_score))}%` }}
                />
              </div>
              <span className="font-display text-lg">{Math.round(r.final_score)}</span>
            </div>
            <p className="mt-2 text-[15px]">{r.why}</p>
            {r.has_date && r.date_id && (
              <a
                href={`/dates/${r.date_id}`}
                className="mt-2 inline-block font-bold underline decoration-hot decoration-[3px] underline-offset-4"
              >
                Read their date
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
