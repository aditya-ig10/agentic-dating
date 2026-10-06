// /dates/[id] — DATE VIEWER (video hero #2). Live GET route + offline fallback.
"use client";

import { use, useEffect, useState } from "react";
import DateTranscript from "@/components/DateTranscript";
import { Loading } from "@/components/States";
import { api } from "@/lib/api";
import type { DateWithVerdicts, Verdict, Person } from "@/lib/types";
import {
  fixturePeople,
  fixtureDateId,
  fixtureTranscript,
  fixtureVerdicts,
} from "@/fixtures/people";

function nameFor(map: Map<string, string>, id: string): string {
  return map.get(id) ?? "Agent";
}

export default function DatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<{
    date: DateWithVerdicts;
    verdicts: Verdict[];
    names: Map<string, string>;
    offline: boolean;
  } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const { date, verdicts } = await api.getDate(id);
        if (!live) return;
        const people = await api.listPeople().catch(() => [] as Person[]);
        const names = new Map(people.map((p) => [p.id, p.name] as [string, string]));
        setData({ date, verdicts, names, offline: false });
      } catch {
        if (!live) return;
        if (id !== fixtureDateId) {
          setMissing(true);
          return;
        }
        const a = fixturePeople[0].id;
        const b = fixturePeople[1].id;
        setData({
          date: {
            id: fixtureDateId,
            a_id: a,
            b_id: b,
            status: "done",
            transcript: fixtureTranscript.map((t) => ({ ...t })),
            created_at: new Date(0).toISOString(),
            verdicts: fixtureVerdicts,
          },
          verdicts: fixtureVerdicts,
          names: new Map(fixturePeople.map((p) => [p.id, p.name])),
          offline: true,
        });
      }
    })();
    return () => {
      live = false;
    };
  }, [id]);

  if (missing) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <h1 className="font-display text-3xl uppercase">Table for… nobody</h1>
        <p className="mt-2 text-bone/70">
          No date with id “{id}” — it may still be queued.
        </p>
        <a
          href="/people"
          className="mt-4 inline-block font-bold underline decoration-hot decoration-[3px] underline-offset-4"
        >
          Back to the lineup
        </a>
      </div>
    );
  }

  if (!data) return <Loading label="Eavesdropping…" />;

  return (
    <DateTranscript
      date={data.date}
      verdicts={data.verdicts}
      aName={nameFor(data.names, data.date.a_id)}
      bName={nameFor(data.names, data.date.b_id)}
      nameOf={(pid) => nameFor(data.names, pid)}
    />
  );
}
