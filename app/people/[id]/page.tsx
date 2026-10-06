// /people/[id] — PROFILE page (video hero #1). Live GET routes + offline fallback.
"use client";

import { use } from "react";
import ProfileCard from "@/components/ProfileCard";
import RankingList from "@/components/RankingList";
import { Loading, ErrorState } from "@/components/States";
import { usePersonBundle } from "./use-person";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { bundle, missing } = usePersonBundle(id);

  if (missing) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <h1 className="font-display text-3xl uppercase">Nobody by that name</h1>
        <p className="mt-2 text-bone/70">No dossier with id “{id}” in this lineup.</p>
        <a
          href="/people"
          className="mt-4 inline-block font-bold underline decoration-hot decoration-[3px] underline-offset-4"
        >
          Back to the lineup
        </a>
      </div>
    );
  }

  if (!bundle) return <Loading label="Opening the dossier…" />;

  return (
    <div>
      <a
        href="/people"
        className="font-bold text-bone/60 underline decoration-gold decoration-2 underline-offset-4 hover:text-bone"
      >
        The lineup
      </a>
      {bundle.offline && (
        <p className="mt-2 text-sm text-gold">
          Offline copy — live analysis lands once the backend connects.
        </p>
      )}
      <div className="mt-3">
        {bundle.analysis ? (
          <ProfileCard person={bundle.person} analysis={bundle.analysis} />
        ) : (
          <ErrorState message={`${bundle.person.name}'s analysis hasn't run yet — check back after ingest.`} />
        )}
      </div>
      <section className="mx-auto mt-12 max-w-4xl">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl uppercase sm:text-3xl">
            Front <span className="text-gold">runners</span>
          </h2>
          <a
            href={`/people/${bundle.person.id}/ranking`}
            className="font-bold underline decoration-hot decoration-[3px] underline-offset-4"
          >
            Full leaderboard
          </a>
        </div>
        <div className="mt-4">
          <RankingList rows={bundle.rows.slice(0, 3)} />
        </div>
      </section>
    </div>
  );
}
