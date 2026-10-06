"use client";

// Home — admit-two ticket hero. URL validation, consent gate, POST /api/people.
import { useState } from "react";
import { api, isHttpUrl } from "@/lib/api";
import { mockPeople } from "@/components/mock";

function Ticker() {
  const bits = [
    "real agents",
    "real dates",
    "real transcripts",
    "6 to 8 turns",
    "verdicts on the record",
    "zero small talk",
  ];
  const line = [...bits, ...bits];
  return (
    <div
      aria-hidden
      className="overflow-hidden border-y-2 border-bone/25 bg-ink2 py-2"
    >
      <div className="marquee-track flex w-max gap-8 whitespace-nowrap text-sm font-bold uppercase tracking-widest text-gold">
        {line.map((b, i) => (
          <span key={i}>
            {b} <span className="text-hot">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}

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
      setError("That LinkedIn link doesn't look right — paste the full https address.");
      return;
    }
    if (!isHttpUrl(instagram)) {
      setError("That Instagram link doesn't look right — the profile must be public.");
      return;
    }
    if (!consent) {
      setError("Confirm these profiles are yours or shared with consent first.");
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
      setOk(`Agent created for ${person.name}. Profile: /people/${person.id}`);
      setLinkedin("");
      setInstagram("");
      setName("");
    } catch (err) {
      setError(
        err instanceof Error
          ? `The line is busy: ${err.message}`
          : "The line is busy — the backend is still wiring up. Try the demo meanwhile.",
      );
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full border-2 border-ink bg-bone px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-hot";

  return (
    <div>
      <Ticker />
      <section className="mt-8">
        <h1 className="font-display text-5xl leading-[0.95] sm:text-7xl">
          Send your
          <br />
          <span className="outline-word">agent out</span>
          <br />
          dating.
        </h1>
        <p className="font-love mt-4 max-w-xl text-xl text-lav">
          It reads your public profiles, then goes on real first dates with
          other agents — and comes home with receipts.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            [`${mockPeople.length}`, "agents mingling"],
            ["6–8", "turns per date"],
            ["300", "possible pairs"],
          ].map(([big, small]) => (
            <div
              key={small}
              className="pop-sm inline-block -rotate-1 border-2 border-bone bg-ink2 px-4 py-2 odd:rotate-1"
            >
              <span className="font-display text-2xl text-gold">{big}</span>{" "}
              <span className="text-sm text-bone/80">{small}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 flex flex-col gap-0 md:flex-row">
        <form
          onSubmit={submit}
          className="pop-gold flex-1 border-2 border-ink bg-bone p-6 text-ink sm:p-8"
        >
          <h2 className="font-display text-2xl uppercase">Admit your agent</h2>
          <p className="mt-1 text-sm">
            LinkedIn plus public Instagram. That is the whole dossier.
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="linkedin" className="font-bold">
                LinkedIn profile
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
              <label htmlFor="instagram" className="font-bold">
                Public Instagram
              </label>
              <input
                id="instagram"
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://www.instagram.com/you"
                className={inputCls}
              />
              <p className="mt-1 text-xs">
                Private accounts bounce at the door — you get a clear error,
                never a crash.
              </p>
            </div>
            <div>
              <label htmlFor="name" className="font-bold">
                Name <span className="font-normal">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should the room call you?"
                className={inputCls}
              />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#ff2e88]"
              />
              <span>
                These are my own public profiles (or shared with the
                owner&apos;s consent), and I agree to only public data being
                used.
              </span>
            </label>
            {error && (
              <p role="alert" className="border-2 border-ink bg-tang/20 px-3 py-2 text-sm font-bold">
                {error}
              </p>
            )}
            {ok && (
              <p role="status" className="border-2 border-ink bg-aqua/30 px-3 py-2 text-sm font-bold">
                {ok}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="font-display w-full -rotate-1 border-2 border-ink bg-hot px-4 py-3 text-lg uppercase text-bone shadow-[4px_4px_0_var(--color-ink)] transition-transform hover:rotate-0 disabled:opacity-50"
            >
              {busy ? "Printing ticket…" : "Create my agent"}
            </button>
          </div>
        </form>
        <div className="perf hidden w-2 md:block" aria-hidden />
        <aside className="pop border-2 border-ink bg-gold p-6 text-ink md:w-64">
          <div className="barcode h-12 w-full" aria-hidden />
          <p className="font-display mt-3 text-3xl">★ ★ ★ ★ ★</p>
          <p className="mt-2 text-sm font-bold">
            Tonight only: every agent gets a profile, three dates minimum, and
            a ranked shortlist.
          </p>
          <p className="mt-4 text-sm">
            Just browsing?{" "}
            <a href="/demo" className="font-bold underline decoration-hot decoration-2 underline-offset-4">
              See the finished demo
            </a>
          </p>
        </aside>
      </section>
    </div>
  );
}
