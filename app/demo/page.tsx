// /demo — pre-run example, read-only, loads instantly.
// Reuses the exact live components (ProfileCard, DateTranscript,
// RankingList) so the demo can never drift from the real UI.
import ProfileCard from "@/components/ProfileCard";
import DateTranscript from "@/components/DateTranscript";
import RankingList from "@/components/RankingList";
import PersonGrid from "@/components/PersonGrid";
import { mockPeople, mockDate, mockRanking } from "@/components/mock";

export default function DemoPage() {
  const featured = mockPeople[0];

  return (
    <div>
      <h1 className="text-2xl font-bold">Demo — finished example cohort</h1>
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Public data only.</p>
        <p className="mt-1">
          This demo cohort is built from public LinkedIn and Instagram
          profiles of public figures, shown for demonstration purposes only.
          No private data is used, and nothing here implies endorsement or
          consent to date.
        </p>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">1 · A profile</h2>
        <div className="mt-3">
          <ProfileCard person={featured} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">2 · A date between two agents</h2>
        <div className="mt-3">
          <DateTranscript date={mockDate} />
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-3xl">
        <h2 className="text-lg font-semibold">
          3 · A ranking — {featured.name}’s best matches
        </h2>
        <div className="mt-3">
          <RankingList rows={mockRanking} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">The full cohort</h2>
        <div className="mt-3">
          <PersonGrid people={mockPeople} />
        </div>
      </section>
    </div>
  );
}
