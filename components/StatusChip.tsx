// StatusChip — small status pill for person / date states.
import type { MockPerson, MockDate } from "./mock";

type Status = MockPerson["status"] | MockDate["status"];

const styles: Record<Status, string> = {
  pending: "bg-stone-100 text-stone-600",
  queued: "bg-stone-100 text-stone-600",
  scraped: "bg-sky-100 text-sky-800",
  running: "bg-sky-100 text-sky-800",
  analyzed: "bg-emerald-100 text-emerald-800",
  done: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

export default function StatusChip({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-stone-100 text-stone-600"}`}
    >
      {status}
    </span>
  );
}
