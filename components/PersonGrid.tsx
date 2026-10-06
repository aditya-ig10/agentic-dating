// PersonGrid — trading-card wall. Search stays, cards become collectible
// dossiers: giant initial medallion, headline, neon stamp, bold link.
"use client";

import { useState } from "react";
import StatusChip from "./StatusChip";
import type { MockPerson } from "./mock";

const medallions = ["bg-hot text-bone", "bg-aqua text-ink", "bg-gold text-ink", "bg-tang text-bone"];

export default function PersonGrid({ people }: { people: MockPerson[] }) {
  const [query, setQuery] = useState("");
  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Find your contender…"
        aria-label="Search people"
        className="w-full border-2 border-bone/40 bg-ink2 px-4 py-3 text-bone placeholder:text-bone/40 focus:border-gold focus:outline-none"
      />
      {filtered.length === 0 ? (
        <p className="mt-6 border-2 border-dashed border-bone/40 p-6 text-bone/70">
          {people.length === 0
            ? "The room is empty — add the first contender on the home page."
            : `Nobody matches “${query}”. Try another name.`}
        </p>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <li
              key={p.id}
              className={`pop-sm border-2 border-ink bg-bone p-5 text-ink ${
                i % 3 === 0 ? "-rotate-1" : i % 3 === 1 ? "rotate-1" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  aria-hidden
                  className={`font-display flex h-12 w-12 items-center justify-center border-2 border-ink text-xl ${medallions[i % medallions.length]}`}
                >
                  {p.name.charAt(0)}
                </span>
                <StatusChip status={p.status} />
              </div>
              <p className="font-display mt-3 text-xl uppercase leading-tight">{p.name}</p>
              <p className="font-love mt-1 text-ink/70">{p.analysis.headline}</p>
              <a
                href={`/people/${p.id}`}
                className="mt-3 inline-block font-bold underline decoration-hot decoration-[3px] underline-offset-4"
              >
                Open dossier
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
