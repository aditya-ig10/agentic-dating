"use client";

// /run — cohort control (unlinked from nav prominence).
// Triggers one chunk of the cohort run, then polls job progress.
// Graceful while backend routes are still landing: shows the error
// message from the API layer instead of crashing.
import { useState } from "react";
import { api } from "@/lib/api";

export default function RunPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function trigger() {
    setBusy(true);
    setStatus("Triggering one cohort chunk…");
    try {
      const res = (await api.runCohort()) as {
        job_id?: string;
        status?: string;
      };
      setStatus(
        res.job_id
          ? `Chunk started (job ${res.job_id}). Re-press to continue the next chunk.`
          : `Cohort endpoint replied: ${res.status ?? "ok"}. Re-press to continue.`,
      );
    } catch (err) {
      setStatus(
        err instanceof Error
          ? `Backend not ready yet: ${err.message}`
          : "Backend not ready yet — the cohort routes are still landing.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Cohort run</h1>
      <p className="mt-1 text-sm text-stone-600">
        Each press runs one small chunk (scoring, a few dates, or ranking
        progress) so serverless timeouts never kill the batch. Keep pressing
        until the cohort is fully dated.
      </p>
      <button
        onClick={trigger}
        disabled={busy}
        className="mt-4 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
      >
        {busy ? "Running…" : "Run next chunk"}
      </button>
      {status && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-700"
        >
          {status}
        </p>
      )}
    </div>
  );
}
