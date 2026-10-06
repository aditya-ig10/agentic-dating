// /people/[id]/ranking — full ordered best-fits list.
// Mock-backed; swaps to GET /api/people/:id/ranking when live.
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
        <h1 className="text-xl font-semibold">No ranking found</h1>
        <p className="mt-1 text-sm text-stone-600">
          Nobody with id “{id}” exists in this cohort.
        </p>
        <a
          href="/people"
          className="mt-4 inline-block text-sm font-medium text-rose-700 hover:underline"
        >
          ← Back to the cohort
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <a
        href={`/people/${person.id}`}
        className="text-sm text-stone-500 hover:underline"
      >
        ← {person.name}’s profile
      </a>
      <h1 className="mt-2 text-2xl font-bold">
        Best matches for {person.name}
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        Blends full-date verdicts (70%) with pre-scores (30%). Rows tagged
        “pre-score only” haven’t had a full date yet.
      </p>
      <div className="mt-4">
        <RankingList rows={mockRanking} />
      </div>
    </div>
  );
}
