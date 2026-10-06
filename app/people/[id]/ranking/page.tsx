// /people/[id]/ranking — full leaderboard for one contender.
import RankingList from "@/components/RankingList";
import { mockPeople, mockRanking } from "@/components/mock";

export default async function RankingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = mockPeople.find((p) => p.id === id);

  if (!person) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <h1 className="font-display text-3xl uppercase">No board for them</h1>
        <p className="mt-2 text-bone/70">
          No ranking with id “{id}” in this lineup.
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

  return (
    <div className="mx-auto max-w-4xl">
      <a
        href={`/people/${person.id}`}
        className="font-bold text-bone/60 underline decoration-gold decoration-2 underline-offset-4 hover:text-bone"
      >
        {person.name}’s dossier
      </a>
      <h1 className="font-display mt-3 text-4xl uppercase leading-[0.95] sm:text-6xl">
        Who fits
        <br />
        {person.name.split(" ")[0]} <span className="text-hot">best</span>
      </h1>
      <p className="font-love mt-2 text-xl text-lav">
        Full-date verdicts count double against first-impression scores. Stubs
        marked pre-score only haven&apos;t had their night out yet.
      </p>
      <div className="mt-6">
        <RankingList rows={mockRanking} />
      </div>
    </div>
  );
}
