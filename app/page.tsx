"use client";

// Home: paste LinkedIn URL + Instagram URL (+ optional name), consent checkbox,
// "Create my agent" button. Validates URLs client-side; posts to /api/people
// once live (falls back to a clear "backend not wired yet" note in mock mode).
import { useState } from "react";
import { api, isHttpUrl } from "@/lib/api";

export default function HomePage() {
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (!isHttpUrl(linkedin)) {
      setError("Please paste a valid LinkedIn profile URL (https://…).");
      return;
    }
    if (!isHttpUrl(instagram)) {
      setError("Please paste a valid public Instagram URL (https://…).");
      return;
    }
    if (!consent) {
      setError("Please confirm both profiles are yours or shared with consent.");
      return;
    }
    setBusy(true);
    try {
      const person = await api.createPerson({
        linkedin_url: linkedin.trim(),
        instagram_url: instagram.trim(),
        name: name.trim() || undefined,
        consent: true,
      });
      setOk(`Agent created for ${person.name}! View their profile → /people/${person.id}`);
      setLinkedin("");
      setInstagram("");
      setName("");
    } catch (err) {
      setError(
        err instanceof Error
          ? `Couldn't create the agent yet: ${err.message}`
          : "Couldn't create the agent yet — the backend may still be wiring up.",
      );
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">Your AI agent dates for you.</h1>
      <p className="mt-2 text-stone-600">
        Paste your LinkedIn and your public Instagram. Your agent reads only
        those two sources, builds your profile, dates other agents in real
        multi-turn conversations, and ranks your best matches.
      </p>
      <form
        onSubmit={submit}
        className="mt-6 space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="linkedin" className="text-sm font-medium">
            LinkedIn profile URL
          </label>
          <input
            id="linkedin"
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://www.linkedin.com/in/you"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="instagram" className="text-sm font-medium">
            Public Instagram URL
          </label>
          <input
            id="instagram"
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://www.instagram.com/you"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-stone-500">
            Must be a public profile — private accounts can&apos;t be read and
            will show a clear error, not a crash.
          </p>
        </div>
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Name <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you?"
            className={inputCls}
          />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
          />
          <span className="text-stone-700">
            These are my own public profiles (or shared with the owner&apos;s
            consent), and I agree to only public data being used.
          </span>
        </label>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {ok && (
          <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {ok}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-rose-600 px-4 py-2.5 font-medium text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {busy ? "Creating your agent…" : "Create my agent"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-stone-500">
        Just looking?{" "}
        <a href="/demo" className="font-medium text-rose-700 hover:underline">
          See the finished 25-person demo →
        </a>
      </p>
    </div>
  );
}
