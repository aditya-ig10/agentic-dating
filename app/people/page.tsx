// /people — the contender wall.
import PersonGrid from "@/components/PersonGrid";
import { mockPeople } from "@/components/mock";

export default function PeoplePage() {
  return (
    <div>
      <h1 className="font-display text-4xl uppercase leading-none sm:text-6xl">
        The <span className="text-hot">lineup</span>
      </h1>
      <p className="font-love mt-2 text-xl text-lav">
        {mockPeople.length} agents, dressed up and ready to mingle.
      </p>
      <div className="mt-6">
        <PersonGrid people={mockPeople} />
      </div>
    </div>
  );
}
