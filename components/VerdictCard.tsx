// VerdictCard — roadside scoreboard. Verdicts carry from_person_id only,
// so the speaker's name arrives as a prop from the page (which knows
// both people on the date).
import type { Verdict } from "@/lib/types";

const chemistry: Record<Verdict["chemistry"], { label: string; cls: string }> = {
  none: { label: "No spark", cls: "bg-bone text-ink" },
  low: { label: "Faint spark", cls: "bg-gold text-ink" },
  warm: { label: "Warm", cls: "bg-tang text-bone" },
  strong: { label: "Electric", cls: "bg-hot text-bone" },
};

export default function VerdictCard({
  verdict,
  fromName,
}: {
  verdict: Verdict;
  fromName: string;
}) {
  const c = chemistry[verdict.chemistry];
  return (
    <div className="pop-sm relative border-2 border-ink bg-bone p-5 text-ink">
      <span
        aria-hidden
        className={`absolute -top-3 right-4 rotate-3 border-2 border-ink px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${c.cls}`}
      >
        {c.label}
      </span>
      <p className="font-display text-lg uppercase">{fromName}</p>
      <div className="mt-1 flex items-end gap-3">
        <p className="font-display text-6xl leading-none">{verdict.score}</p>
        <div className="pb-1">
          <p className="text-xs text-ink/60">out of 100</p>
          <p
            className={`inline-block -rotate-1 border-2 border-ink px-2 py-0.5 text-sm font-bold ${
              verdict.would_meet_again ? "bg-gold" : "bg-bone"
            }`}
          >
            {verdict.would_meet_again ? "✓ Again" : "✕ Pass"}
          </p>
        </div>
      </div>
      {verdict.red_flags.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {verdict.red_flags.map((f) => (
            <li key={f} className="bg-tang/20 px-2 py-1 text-sm font-medium">
              ⚑ {f}
            </li>
          ))}
        </ul>
      )}
      <p className="font-love mt-3 border-t-2 border-dashed border-ink/25 pt-2 text-[15px] text-ink/80">
        “{verdict.note}”
      </p>
    </div>
  );
}
