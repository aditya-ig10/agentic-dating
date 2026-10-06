// RankingList — ordered best fits with final score and "why".
// Rows link to the date transcript when a full date exists,
// otherwise carry a "pre-score only" tag.
import type { RankingRow } from "./mock";

export default function RankingList({ rows }: { rows: RankingRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        No ranking yet — matches appear here once scoring runs.
      </p>
    );
  }
  return (
    <ol className="space-y-3">
      {rows.map((r) => (
        <li
          key={r.candidate_id}
          className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
        >
          <p className="w-8 shrink-0 text-2xl font-bold text-stone-300">
            {r.rank}
          </p>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-stone-900">{r.candidate_name}</p>
              {!r.has_date && (
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                  pre-score only
                </span>
              )}
            </div>
            <div
              className="mt-2 flex items-center gap-2"
              aria-label={`Final score ${r.final_score} out of 100`}
            >
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-rose-500"
                  style={{ width: `${r.final_score}%` }}
                />
              </div>
              <span className="text-sm font-medium text-stone-700">
                {r.final_score}
              </span>
            </div>
            <p className="mt-2 text-sm text-stone-600">{r.why}</p>
            {r.has_date && r.date_id && (
              <a
                href={`/dates/${r.date_id}`}
                className="mt-2 inline-block text-sm font-medium text-rose-700 hover:underline"
              >
                Read their date →
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
