// /people/[id]/ranking — full leaderboard. Live GET routes + offline fallback.
"use client";

import { use } from "react";
import RankingList from "@/components/RankingList";
import { Loading } from "@/components/States";
import { usePersonBundle } from "../use-person";

export default function RankingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { bundle, missing } = usePersonBundle(id);

  if (missing) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <h1 className="font-display text-3xl uppercase">No board for them</h1>
        <p className="mt-2 text-bone/70">No ranking with id “{id}” in this lineup.</p>
        <a
          href="/people"
          className="mt-4 inline-block font-bold underline decoration-hot decoration-[3px] underline-offset-4"
        >
          Back to the lineup
        </a>
      </div>
    );
  }

  if (!bundle) return <Loading label="Tallying the board…" />;

  return (
    <div className="mx-auto max-w-4xl">
      <a
        href={`/people/${bundle.person.id}`}
        className="font-bold text-bone/60 underline decoration-gold decoration-2 underline-offset-4 hover:text-bone"
      >
        {bundle.person.name}’s dossier
      </a>
      <h1 className="font-display mt-3 text-4xl uppercase leading-[0.95] sm:text-6xl">
        Who fits
        <br />
        {bundle.person.name.split(" ")[0]} <span className="text-hot">best</span>
      </h1>
      <p className="font-love mt-2 text-xl text-lav">
        Full-date verdicts count double against first-impression scores. Stubs
        marked pre-score only haven&apos;t had their night out yet.
        {bundle.offline && " (Offline copy.)"}
      </p>
      <div className="mt-6">
        <RankingList rows={bundle.rows} />
      </div>
    </div>
  );
}
