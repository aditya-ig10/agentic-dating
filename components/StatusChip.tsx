// StatusChip — neon stamp. Status literals match lib/types.ts exactly.
import type { PersonStatus, DateStatus } from "@/lib/types";

type Status = PersonStatus | DateStatus;

const styles: Record<Status, string> = {
  pending: "bg-bone text-ink border-ink",
  queued: "bg-bone text-ink border-ink",
  scraped: "bg-aqua text-ink border-ink",
  running: "bg-aqua text-ink border-ink",
  analyzed: "bg-gold text-ink border-ink",
  done: "bg-gold text-ink border-ink",
  failed: "bg-tang text-ink border-ink",
};

export default function StatusChip({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block -rotate-2 border-2 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${styles[status] ?? "bg-bone text-ink border-ink"}`}
    >
      {status}
    </span>
  );
}
