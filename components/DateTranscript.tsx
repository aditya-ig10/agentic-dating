// DateTranscript — chat-bubble transcript + both verdict cards.
// Speaker A left (rose-tinted), speaker B right (neutral). Replay cut for now.
import StatusChip from "./StatusChip";
import VerdictCard from "./VerdictCard";
import type { MockDate } from "./mock";

export default function DateTranscript({ date }: { date: MockDate }) {
  const names = { a: date.a_name, b: date.b_name };
  return (
    <article className="mx-auto max-w-3xl">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-stone-900">
          {date.a_name} <span className="font-normal text-stone-400">×</span>{" "}
          {date.b_name}
        </h1>
        <StatusChip status={date.status} />
      </header>

      {date.transcript.length === 0 ? (
        <p className="mt-6 text-sm text-stone-500">
          This date hasn&apos;t happened yet — check back once both agents have
          talked.
        </p>
      ) : (
        <ol className="mt-6 space-y-4">
          {date.transcript.map((turn, i) => (
            <li
              key={i}
              className={`flex ${turn.speaker === "a" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  turn.speaker === "a"
                    ? "rounded-bl-md bg-rose-50 text-stone-900"
                    : "rounded-br-md bg-white text-stone-900 ring-1 ring-stone-200"
                }`}
              >
                <p className="mb-1 text-xs font-semibold text-stone-500">
                  {names[turn.speaker]}
                </p>
                <p>{turn.text}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {date.verdicts.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900">
            Verdicts — in their own words
          </h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {date.verdicts.map((v) => (
              <VerdictCard key={v.from_person_id} verdict={v} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
