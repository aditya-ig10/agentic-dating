// ProfileCard — the video-first profile page body.
// Renders every AGENDA §4 analysis field: summary, evidence sections,
// communication style, partner wants, dealbreakers, confidence, data gaps.
import EvidenceList from "./EvidenceList";
import StatusChip from "./StatusChip";
import type { MockPerson } from "./mock";

export default function ProfileCard({ person }: { person: MockPerson }) {
  const a = person.analysis;
  return (
    <article className="mx-auto max-w-3xl">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-stone-900">{person.name}</h1>
          <StatusChip status={person.status} />
        </div>
        <p className="mt-1 text-lg text-stone-600">{a.headline}</p>
        <div
          className="mt-3 flex items-center gap-2"
          aria-label={`Analysis confidence ${Math.round(a.confidence * 100)} percent`}
        >
          <div className="h-2 w-40 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-rose-500"
              style={{ width: `${Math.round(a.confidence * 100)}%` }}
            />
          </div>
          <span className="text-sm text-stone-600">
            {Math.round(a.confidence * 100)}% confidence
          </span>
        </div>
      </header>

      <p className="mt-6 leading-relaxed text-stone-800">{a.summary}</p>

      <div className="mt-8 space-y-8">
        <EvidenceList title="Needs" items={a.needs} />
        <EvidenceList title="Hobbies" items={a.hobbies} />
        <EvidenceList title="Interests" items={a.interests} />
        <EvidenceList title="Values" items={a.values} />
        <EvidenceList title="Personality" items={a.personality} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {a.communication_style && (
          <section className="rounded-xl border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Communication style
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-800">
              {a.communication_style}
            </p>
          </section>
        )}
        {a.partner_wants.length > 0 && (
          <section className="rounded-xl border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              What they want in a partner
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-800">
              {a.partner_wants.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {a.dealbreakers.length > 0 && (
        <section className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-red-700">
            Dealbreakers
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {a.dealbreakers.map((d) => (
              <li
                key={d}
                className="rounded-full bg-white px-3 py-1 text-sm text-red-800 shadow-sm"
              >
                {d}
              </li>
            ))}
          </ul>
        </section>
      )}

      {a.data_gaps.length > 0 && (
        <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-700">
            Data gaps — read with care
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {a.data_gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
