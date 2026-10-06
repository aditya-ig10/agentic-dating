// EvidenceList — pinned dossier slips. Each claim is a rotated slip with
// tape, alternating tilt; the evidence reads like a field note.
import type { EvidenceClaim } from "./mock";

export default function EvidenceList({
  title,
  items,
  accent = "gold",
}: {
  title: string;
  items: EvidenceClaim[];
  accent?: "gold" | "aqua" | "hot";
}) {
  if (items.length === 0) return null;
  const bar = { gold: "bg-gold", aqua: "bg-aqua", hot: "bg-hot" }[accent];
  return (
    <section>
      <h3 className="font-display inline-block bg-ink px-3 py-1 text-sm uppercase tracking-wide text-bone">
        {title}
      </h3>
      <ul className="mt-3 space-y-4">
        {items.map((item, i) => (
          <li
            key={item.text}
            className={`pop-sm relative border-2 border-ink bg-bone p-4 text-ink ${i % 2 === 0 ? "-rotate-1" : "rotate-1"}`}
          >
            <span
              aria-hidden
              className={`absolute -top-2 left-6 h-4 w-14 -rotate-3 border border-ink/20 ${bar} opacity-80`}
            />
            <p className="font-bold">{item.text}</p>
            <p className="font-love mt-1 text-[15px] text-ink/75">
              “{item.evidence}”
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
