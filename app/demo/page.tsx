// /demo — the finished example, read-only, loads instantly.
// Same live components throughout, so the demo can never drift.
// Reads straight from fixtures/people.ts (the exact data backing the DB seed).
import ProfileCard from "@/components/ProfileCard";
import DateTranscript from "@/components/DateTranscript";
import RankingList from "@/components/RankingList";
import type { RankedRow } from "@/components/RankingList";
import PersonGrid from "@/components/PersonGrid";
import type { Person } from "@/lib/types";
import {
  fixturePeople,
  fixtureAnalyses,
  fixtureDateId,
  fixtureTranscript,
  fixtureVerdicts,
  fixtureRanking,
} from "@/fixtures/people";

const featured = fixturePeople[0];

const demoPerson: Person = {
  ...featured,
  error: null,
  created_at: new Date(0).toISOString(),
};

const demoPeople: Person[] = fixturePeople.map((f) => ({
  ...f,
  error: null,
  created_at: new Date(0).toISOString(),
}));

const demoRows: RankedRow[] = fixtureRanking.map((r) => ({
  ...r,
  has_date: r.candidate_id === fixtureRanking[0].candidate_id,
  date_id: r.candidate_id === fixtureRanking[0].candidate_id ? fixtureDateId : undefined,
}));

const demoDate = {
  id: fixtureDateId,
  a_id: fixturePeople[0].id,
  b_id: fixturePeople[1].id,
  status: "done" as const,
  transcript: fixtureTranscript.map((t) => ({ ...t })),
  created_at: new Date(0).toISOString(),
  verdicts: fixtureVerdicts,
};

const demoNames = new Map(fixturePeople.map((p) => [p.id, p.name]));

export default function DemoPage() {
  return (
    <div>
      <h1 className="font-display text-4xl uppercase leading-[0.95] sm:text-6xl">
        Tonight&apos;s <span className="outline-word">replay</span>
      </h1>
      <div className="pop-sm mt-5 -rotate-1 border-2 border-ink bg-gold p-4 text-sm font-medium text-ink">
        <p className="font-display uppercase">Public data only.</p>
        <p className="mt-1">
          This demo lineup is built from public LinkedIn and Instagram
          profiles of public figures, shown for demonstration only. No private
          data is used, and nothing here implies endorsement or consent to
          date.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl uppercase">
          <span className="bg-hot px-2 text-bone">1 · The dossier</span>
        </h2>
        <div className="mt-4">
          <ProfileCard
            person={demoPerson}
            analysis={fixtureAnalyses[featured.id]}
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl uppercase">
          <span className="bg-aqua px-2 text-ink">2 · The date</span>
        </h2>
        <div className="mt-4">
          <DateTranscript
            date={demoDate}
            verdicts={fixtureVerdicts}
            aName={demoNames.get(demoDate.a_id) ?? "Agent"}
            bName={demoNames.get(demoDate.b_id) ?? "Agent"}
            nameOf={(pid) => demoNames.get(pid) ?? "Agent"}
          />
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-4xl">
        <h2 className="font-display text-2xl uppercase">
          <span className="bg-gold px-2 text-ink">3 · The leaderboard</span>
        </h2>
        <div className="mt-4">
          <RankingList rows={demoRows} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl uppercase">The full lineup</h2>
        <div className="mt-4">
          <PersonGrid people={demoPeople} />
        </div>
      </section>
    </div>
  );
}
