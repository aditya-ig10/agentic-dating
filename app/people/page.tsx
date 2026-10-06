// /people — cohort grid. Mock-backed until A's contracts land,
// then swaps to GET /api/people (see lib/api.ts).
import PersonGrid from "@/components/PersonGrid";
import { mockPeople } from "@/components/mock";

export default function PeoplePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">The cohort</h1>
      <p className="mt-1 text-sm text-stone-600">
        {mockPeople.length} people · agents dating on their behalf
      </p>
      <div className="mt-4">
        <PersonGrid people={mockPeople} />
      </div>
    </div>
  );
}
