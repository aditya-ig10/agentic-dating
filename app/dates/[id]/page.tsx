// /dates/[id] — DATE VIEWER (video hero #2).
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

  return <DateTranscript date={mockDate} />;
}
