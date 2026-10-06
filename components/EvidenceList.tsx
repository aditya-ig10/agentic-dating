// EvidenceList — a titled list of { text, evidence } claims.
// Every claim carries its evidence snippet (AGENDA §4: evidence per claim).
import type { EvidenceClaim } from "./mock";

export default function EvidenceList({
  title,
  items,
}: {
  title: string;
  items: EvidenceClaim[];
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
        {title}
      </h3>
      <ul className="mt-2 space-y-3">
        {items.map((item) => (
          <li key={item.text}>
            <p className="text-stone-900">{item.text}</p>
            <blockquote className="mt-1 border-l-2 border-rose-200 pl-3 text-sm italic text-stone-600">
              {item.evidence}
            </blockquote>
          </li>
        ))}
      </ul>
    </section>
  );
}
