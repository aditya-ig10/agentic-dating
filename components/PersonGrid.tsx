// PersonGrid — cohort grid with client-side search filter.
// Pure presentational: takes people, filters by name locally.
"use client";

import { useState } from "react";
import StatusChip from "./StatusChip";
import type { MockPerson } from "./mock";

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
        placeholder="Search the cohort…"
        aria-label="Search people"
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
      />
      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-stone-500">
          {people.length === 0
            ? "Nobody here yet — add the first person on the home page."
            : `No matches for “${query}”.`}
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-stone-900">{p.name}</p>
                <StatusChip status={p.status} />
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                {p.analysis.headline}
              </p>
              <a
                href={`/people/${p.id}`}
                className="mt-3 inline-block text-sm font-medium text-rose-700 hover:underline"
              >
                View profile →
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
