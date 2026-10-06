"use client";

// /run — the booth behind the curtain. One chunk per press, graceful errors.
import { useState } from "react";
import { api } from "@/lib/api";

export default function RunPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function trigger() {
    setBusy(true);
    setStatus("Warming up the room…");
    try {
      const res = (await api.runCohort()) as {
        job_id?: string;
        status?: string;
      };
      setStatus(
        res.job_id
          ? `Chunk is running (job ${res.job_id}). Press again for the next chunk.`
          : `The booth replied: ${res.status ?? "ok"}. Press again to continue.`,
      );
    } catch (err) {
      setStatus(
        err instanceof Error
          ? `Booth's closed for now: ${err.message}`
          : "Booth's closed for now — the cohort routes are still landing.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-4xl uppercase sm:text-5xl">
        The control <span className="text-aqua">booth</span>
      </h1>
      <p className="font-love mt-2 text-xl text-lav">
        One chunk per press — scoring, a few dates, ranking progress. Patience
        is part of the show.
      </p>
      <button
        onClick={trigger}
        disabled={busy}
        className="font-display pop-gold mt-6 w-full -rotate-1 border-2 border-ink bg-hot px-4 py-3 text-lg uppercase text-bone hover:rotate-0 disabled:opacity-50"
      >
        {busy ? "Running…" : "Run next chunk"}
      </button>
      {status && (
        <p
          role="status"
          className="pop-sm mt-4 border-2 border-ink bg-bone px-4 py-3 font-medium text-ink"
        >
          {status}
        </p>
      )}
    </div>
  );
}
