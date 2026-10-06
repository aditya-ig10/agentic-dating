// Shared hook: person + ranking + dates in parallel, fixture fallback.
// One place so profile + ranking pages can't drift.
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Person, Analysis, RankingEntry } from "@/lib/types";
import type { PersonRanking } from "@/lib/api";
import type { RankedRow } from "@/components/RankingList";
import {
  fixturePeople,
  fixtureAnalyses,
  fixtureRanking,
  fixtureDateId,
  fixtureTranscript,
  fixtureVerdicts,
} from "@/fixtures/people";

export interface PersonBundle {
  person: Person;
  analysis: Analysis | null;
  rows: RankedRow[];
  offline: boolean;
}

function fixturePerson(id: string): Person {
  const f = fixturePeople.find((p) => p.id === id) ?? fixturePeople[0];
  return { ...f, error: null, created_at: new Date(0).toISOString() };
}

export function usePersonBundle(id: string) {
  const [bundle, setBundle] = useState<PersonBundle | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [{ person, profile }, rankRes, datesRes] = await Promise.all([
          api.getPerson(id),
          api.getRanking(id).catch(() => [] as (RankingEntry & { candidate_name: string })[]),
          api.getDates(id).catch(() => ({ dates: [], verdicts: [] as never[] })),
        ]);
        const ranking: (RankingEntry & { candidate_name: string })[] = Array.isArray(rankRes)
          ? rankRes
          : (rankRes as PersonRanking["ranking"]);
        const { dates } = datesRes;
        if (!live) return;
        const dateByCandidate = new Map<string, string>();
        for (const d of dates as { id: string; a_id: string; b_id: string }[]) {
          const other = d.a_id === id ? d.b_id : d.a_id;
          if (!dateByCandidate.has(other)) dateByCandidate.set(other, d.id);
        }
        const rows: RankedRow[] = (
          ranking as (RankingEntry & { candidate_name: string })[]
        ).map((r) => ({
          ...r,
          has_date: dateByCandidate.has(r.candidate_id),
          date_id: dateByCandidate.get(r.candidate_id),
        }));
        setBundle({ person, analysis: profile?.analysis ?? null, rows, offline: false });
      } catch {
        if (!live) return;
        // Offline/fixture fallback: only fixture Maya has a full bundle.
        if (id !== fixturePeople[0].id && !fixturePeople.some((p) => p.id === id)) {
          setMissing(true);
          return;
        }
        const rows: RankedRow[] = fixtureRanking.map((r) => ({
          ...r,
          has_date: r.candidate_id === fixtureRanking[0].candidate_id,
          date_id:
            r.candidate_id === fixtureRanking[0].candidate_id ? fixtureDateId : undefined,
        }));
        void fixtureTranscript;
        void fixtureVerdicts;
        setBundle({
          person: fixturePerson(id),
          analysis: fixtureAnalyses[id] ?? fixtureAnalyses[fixturePeople[0].id],
          rows,
          offline: true,
        });
      }
    })();
    return () => {
      live = false;
    };
  }, [id]);

  return { bundle, missing };
}
