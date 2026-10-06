// VerdictCard — one agent's structured verdict after a date.
// AGENDA §4 verdict: score 0-100, chemistry, red_flags[], would_meet_again, note.
import type { Verdict } from "./mock";

const chemistryStyles: Record<Verdict["chemistry"], string> = {
  none: "bg-stone-100 text-stone-600",
  low: "bg-amber-100 text-amber-800",
  warm: "bg-orange-100 text-orange-800",
  strong: "bg-rose-100 text-rose-800",
};

export default function VerdictCard({ verdict }: { verdict: Verdict }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-stone-900">{verdict.from_name}</p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${chemistryStyles[verdict.chemistry]}`}
        >
          {verdict.chemistry} chemistry
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <p className="text-3xl font-bold text-stone-900">{verdict.score}</p>
        <div>
          <p className="text-xs text-stone-500">compatibility score / 100</p>
          <p
            className={`text-sm font-medium ${verdict.would_meet_again ? "text-emerald-700" : "text-stone-500"}`}
          >
            {verdict.would_meet_again
              ? "✓ Would meet again"
              : "✗ Would not meet again"}
          </p>
        </div>
      </div>
      {verdict.red_flags.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Red flags
          </p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {verdict.red_flags.map((f) => (
              <li
                key={f}
                className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-700"
              >
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
      <blockquote className="mt-3 border-l-2 border-rose-200 pl-3 text-sm italic text-stone-600">
        “{verdict.note}”
      </blockquote>
    </div>
  );
}
