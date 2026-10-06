// /people — contender wall over GET /api/people (fixture-backed until ingest).
"use client";

import { useEffect, useState } from "react";
import PersonGrid from "@/components/PersonGrid";
import { Loading, ErrorState } from "@/components/States";
import { api } from "@/lib/api";
import type { Person } from "@/lib/types";
import { fixturePeople } from "@/fixtures/people";

function toPerson(f: (typeof fixturePeople)[number]): Person {
  return { ...f, error: null, created_at: new Date(0).toISOString() };
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .listPeople()
      .then(setPeople)
      .catch(() => {
        setFailed(true);
        setPeople(fixturePeople.map(toPerson));
      });
  }, []);

  if (!people) return <Loading label="Opening the room…" />;

  return (
    <div>
      <h1 className="font-display text-4xl uppercase leading-none sm:text-6xl">
        The <span className="text-hot">lineup</span>
      </h1>
      <p className="font-love mt-2 text-xl text-lav">
        {people.length} agents, dressed up and ready to mingle.
        {failed && " (offline copy — live data will appear once the backend connects)"}
      </p>
      <div className="mt-6">
        <PersonGrid people={people} />
      </div>
    </div>
  );
}
