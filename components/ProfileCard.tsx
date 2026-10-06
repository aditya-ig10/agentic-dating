// ProfileCard — contestant dossier. Giant name, serif headline, confidence
// dial, taped evidence slips, dealbreaker stamps, honest data-gap flag.
import EvidenceList from "./EvidenceList";
import StatusChip from "./StatusChip";
import type { MockPerson } from "./mock";

function ConfidenceDial({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="flex items-center gap-3"
      role="img"
      aria-label={`Analysis confidence ${pct} percent`}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="7" className="stroke-bone/20" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className="stroke-gold"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value)}
        />
      </svg>
      <div>
        <p className="font-display text-2xl leading-none text-gold">{pct}%</p>
        <p className="text-sm text-bone/70">dossier confidence</p>
      </div>
    </div>
  );
}

export default function ProfileCard({ person }: { person: MockPerson }) {
  const a = person.analysis;
  return (
    <article className="mx-auto max-w-4xl">
      <header className="border-2 border-bone/30 bg-ink2 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status={person.status} />
        </div>
        <h1 className="font-display mt-3 text-4xl leading-none sm:text-6xl">
          {person.name}
        </h1>
        <p className="font-love mt-2 text-xl text-lav sm:text-2xl">
          {a.headline}
        </p>
        <div className="mt-4">
          <ConfidenceDial value={a.confidence} />
        </div>
      </header>

      <p className="mt-6 max-w-2xl text-lg leading-relaxed">{a.summary}</p>

      <div className="mt-8 space-y-10">
        <EvidenceList title="Needs" items={a.needs} accent="hot" />
        <EvidenceList title="Hobbies" items={a.hobbies} accent="gold" />
        <EvidenceList title="Interests" items={a.interests} accent="aqua" />
        <EvidenceList title="Values" items={a.values} accent="gold" />
        <EvidenceList title="Personality" items={a.personality} accent="aqua" />
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {a.communication_style && (
          <section className="pop-hot -rotate-1 border-2 border-ink bg-hot p-5 text-bone">
            <h3 className="font-display text-sm uppercase tracking-wide">
              How they talk
            </h3>
            <p className="mt-2 leading-relaxed">{a.communication_style}</p>
          </section>
        )}
        {a.partner_wants.length > 0 && (
          <section className="pop rotate-1 border-2 border-ink bg-aqua p-5 text-ink">
            <h3 className="font-display text-sm uppercase tracking-wide">
              Looking for
            </h3>
            <ul className="mt-2 space-y-1.5 font-medium">
              {a.partner_wants.map((w) => (
                <li key={w}>★ {w}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {a.dealbreakers.length > 0 && (
        <section className="pop-sm mt-6 border-2 border-ink bg-bone p-5 text-ink">
          <h3 className="font-display text-sm uppercase tracking-wide">
            Hard no&apos;s
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {a.dealbreakers.map((d, i) => (
              <li
                key={d}
                className={`border-2 border-ink px-3 py-1 text-sm font-bold ${i % 2 ? "rotate-1 bg-tang text-bone" : "-rotate-1 bg-ink text-bone"}`}
              >
                ✕ {d}
              </li>
            ))}
          </ul>
        </section>
      )}

      {a.data_gaps.length > 0 && (
        <section className="mt-6 border-2 border-dashed border-gold bg-ink2 p-5">
          <h3 className="font-display text-sm uppercase tracking-wide text-gold">
              Thin ice — read with care
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-bone/85">
            {a.data_gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
