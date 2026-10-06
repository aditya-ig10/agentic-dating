// /dates/[id] — DATE VIEWER (video hero #2).
// Mock-backed; swaps to GET /api/dates/:id when live.
import DateTranscript from "@/components/DateTranscript";
import { mockDate } from "@/components/mock";

export default async function DatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id !== mockDate.id) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <h1 className="text-xl font-semibold">No date found</h1>
        <p className="mt-1 text-sm text-stone-600">
          No date with id “{id}” exists yet — it may still be queued.
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

  return <DateTranscript date={mockDate} />;
}
