// /demo — the finished example, read-only, loads instantly.
// Same live components throughout, so the demo can never drift.
import ProfileCard from "@/components/ProfileCard";
import DateTranscript from "@/components/DateTranscript";
import RankingList from "@/components/RankingList";
import PersonGrid from "@/components/PersonGrid";
import { mockPeople, mockDate, mockRanking } from "@/components/mock";

export default function DemoPage() {
  const featured = mockPeople[0];

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
          <ProfileCard person={featured} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl uppercase">
          <span className="bg-aqua px-2 text-ink">2 · The date</span>
        </h2>
        <div className="mt-4">
          <DateTranscript date={mockDate} />
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-4xl">
        <h2 className="font-display text-2xl uppercase">
          <span className="bg-gold px-2 text-ink">3 · The leaderboard</span>
        </h2>
        <div className="mt-4">
          <RankingList rows={mockRanking} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl uppercase">The full lineup</h2>
        <div className="mt-4">
          <PersonGrid people={mockPeople} />
        </div>
      </section>
    </div>
  );
}
