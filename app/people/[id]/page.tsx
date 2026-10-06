// /people/[id] — PROFILE page (video hero #1).
// Mock-backed: person + analysis from mock.ts, top-3 ranking preview.
// Swaps to GET /api/people/:id + GET /api/people/:id/ranking when live.
import ProfileCard from "@/components/ProfileCard";
import RankingList from "@/components/RankingList";
import { mockPeople, mockRanking } from "@/components/mock";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = mockPeople.find((p) => p.id === id);

  if (!person) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <h1 className="text-xl font-semibold">No profile found</h1>
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

  const top3 = mockRanking.slice(0, 3);

  return (
    <div>
      <ProfileCard person={person} />
      <section className="mx-auto mt-10 max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Top matches</h2>
          <a
            href={`/people/${person.id}/ranking`}
            className="text-sm font-medium text-rose-700 hover:underline"
          >
            Full ranking →
          </a>
        </div>
        <div className="mt-3">
          <RankingList rows={top3} />
        </div>
      </section>
    </div>
  );
}
