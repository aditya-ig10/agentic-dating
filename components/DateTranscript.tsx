// DateTranscript — the date plays out in a light "room" floating on the lab.
// Speaker names come from transcript rows (speaker_name) with a fallback
// to the page-provided a/b names for older rows.
import StatusChip from "./StatusChip";
import VerdictCard from "./VerdictCard";
import type { DateWithVerdicts, Verdict } from "@/lib/types";

export default function DateTranscript({
  date,
  verdicts,
  aName,
  bName,
  nameOf,
}: {
  date: DateWithVerdicts;
  verdicts: Verdict[];
  aName: string;
  bName: string;
  nameOf: (personId: string) => string;
}) {
  return (
    <article className="mx-auto max-w-4xl">
      <header>
        <StatusChip status={date.status} />
        <h1 className="font-display mt-3 text-4xl leading-[0.95] sm:text-6xl">
          {aName}
          <span className="font-love block text-2xl font-normal text-lav sm:text-4xl">
            on a date with
          </span>
          {bName}
        </h1>
      </header>

      {date.transcript.length === 0 ? (
        <p className="mt-6 border-2 border-dashed border-bone/40 p-6 text-bone/70">
          The table is set but nobody has sat down yet — this date is still
          queued.
        </p>
      ) : (
        <ol className="pop mt-8 space-y-5 border-2 border-ink bg-bone p-5 text-ink sm:p-8">
          {(date.transcript as { speaker: "a" | "b"; speaker_name?: string; text: string }[]).map(
            (turn, i) => (
              <li
                key={i}
                className={`flex ${turn.speaker === "a" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] border-2 border-ink px-4 py-3 text-[15px] leading-relaxed ${
                    turn.speaker === "a"
                      ? "-rotate-[0.5deg] bg-hot/15 shadow-[4px_4px_0_var(--color-hot)]"
                      : "rotate-[0.5deg] bg-white shadow-[4px_4px_0_var(--color-aqua)]"
                  }`}
                >
                  <p
                    className={`font-display mb-1 text-xs uppercase tracking-wider ${
                      turn.speaker === "a" ? "text-hot" : "text-ink/60"
                    }`}
                  >
                    {turn.speaker_name ?? (turn.speaker === "a" ? aName : bName)}
                  </p>
                  <p>{turn.text}</p>
                </div>
              </li>
            ),
          )}
        </ol>
      )}

      {verdicts.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl uppercase sm:text-3xl">
            The morning <span className="text-gold">after</span>
          </h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {verdicts.map((v, i) => (
              <div key={v.from_person_id} className={i === 1 ? "md:translate-y-4" : ""}>
                <VerdictCard verdict={v} fromName={nameOf(v.from_person_id)} />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
