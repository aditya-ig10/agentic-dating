<div align="center">

# 💘 Agentic Dating

**Your AI agent reads your LinkedIn + public Instagram, builds your profile,
then goes on real multi-turn dates with 25 other agents — and ranks your best matches.**

**🌐 Live site** · **[🎬 Demo (pre-run 25-person example)](https://agentic-dating-c.vercel.app/demo)** · **[📜 Video script](docs/video-script.md)**

</div>

---

> **200-character explanation**
> Agentic dating: paste a LinkedIn and a public Instagram, an AI agent profiles you, dates 25+ other agents in live multi-turn chats, then ranks your best matches.

## How it works

```
  paste two public links
          │
          ▼
 ┌─────────────────┐   ┌──────────────────┐   ┌────────────────────────┐
 │ scrape (Apify)  │──▶│ raw_scrapes      │──▶│ analyze (Gemini JSON)  │
 │ IG public posts │   │ cached in Postgres│   │ needs · hobbies ·      │
 │ + LinkedIn URL  │   │ never re-scraped  │   │ values · evidence ·    │
 └─────────────────┘   └──────────────────┘   │ confidence · data_gaps │
                                               └───────────┬────────────┘
                                                           │
          ┌────────────────────────────────────────────────┘
          ▼
 ┌────────────────────┐   ┌──────────────────────────┐   ┌──────────────────┐
 │ pair pre-score     │──▶│ full agent-vs-agent date │──▶│ final ranking    │
 │ all 300 pairs,     │   │ top 3–4 candidates each  │   │ 70% date verdicts│
 │ 1 cheap LLM call   │   │ 6–8 turns + 2 verdicts   │   │ + 30% pre-score  │
 │ per person         │   │ per person               │   │ with reasons     │
 └────────────────────┘   └──────────────────────────┘   └──────────────────┘
```

## What makes the dates real

Each date is an actual conversation, not a score:

- **Persona prompts** are built from that person's analysis — their voice,
  interests, needs, dealbreakers — so every date sounds different.
- **6–8 alternating turns** with a natural opening, genuine curiosity, one
  probing/disagreement moment, and a close.
- Afterward, **each agent writes a structured verdict** from its person's point
  of view: `score 0–100`, `chemistry`, `red_flags[]`, `would_meet_again`,
  `one_line_note`.
- Agents **never fabricate facts** outside the analysis — when unsure they stay
  vague or ask.

See it at **[`/demo`](https://agentic-dating-c.vercel.app/demo)** — the finished
25-person example, loaded instantly, no typing. Or watch a transcript at
`/dates/[id]` with chat bubbles and both verdict cards.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router, TypeScript) + Tailwind 4, deployed on **Vercel free tier** |
| Database | Postgres (**Neon** free tier) via `postgres.js` — no ORM, plain SQL schema |
| Scraping | **Apify** actors for Instagram; every result cached in `raw_scrapes`, never re-scraped |
| LLM | **Gemini** only (`GEMINI_MODEL`) for everything: analysis JSON, pre-scores, date turns, verdicts — with retry/backoff, concurrency caps, and per-call usage counters |
| Coordination | 3 parallel agents, shared `coord/` brain (STATUS / DECISIONS / REQUESTS), git worktrees per agent |

## Technical section: how we scrape

- **Instagram** — Apify `instagram-profile-scraper` over public profile URLs
  (bio, follower counts, latest post captions). Cost tested on 2 profiles first
  (~0.00013 compute units each), then batched across the cohort with per-person
  error isolation: a failed profile is marked `failed` with the error and the
  batch never crashes.
- **LinkedIn** — *skipped, honestly.* Headless cookie auth (`li_at`) redirect-loops
  outside real browsers, and logged-out loads hit the authwall. Per the project's
  fallback rule the pipeline never blocks on one source: payloads are
  Instagram-only plus the person's public LinkedIn headline URL, every analysis
  marks `data_gaps: ["linkedin unavailable — instagram + public headline only"]`,
  and confidence scores reflect the thinner source.
- **Caching** — `raw_scrapes` has a unique `(person_id, source)` key; a scrape is
  executed at most once per person per source.

## Safety & privacy

- **Public data only.** Only public Instagram/LinkedIn URLs are scraped; each row
  carries a consent flag in the DB.
- **No sensitive attributes.** The analysis prompt explicitly forbids inferring or
  displaying religion, sexual orientation, health, politics, ethnicity, or caste.
- **Nothing sensitive in the repo.** `coord/`, `.env.local`, and raw payloads
  (`data/raw/`, DB only) are gitignored. The repo is public and secret-scanned.
- The demo cohort is public figures scraped from their public profiles — the UI
  labels it public-data-only and implies no consent beyond that.

## Run it locally

```bash
npm install
cp coord/.env.local .env.local   # DATABASE_URL, APIFY_TOKEN, GEMINI_API_KEY, GEMINI_MODEL
npm run migrate                  # apply schema.sql
npx tsx scripts/seed.ts          # 4 fixture people (instant UI before real data)
npx tsx scripts/ingest-cohort.ts # scrape cohort (Apify, cached)
npx tsx scripts/run-cohort.ts    # analyze → prescore → dates → rankings
npm run dev                      # http://localhost:3000
```

`run-cohort.ts` is **resumable** — every phase skips work already in the DB, so
re-running after a rate limit continues where it stopped. Each API route does one
small unit of work (one scrape, one analysis, one date) so serverless never times
out; long runs are driven by the local script or the `/run` control page.

## Repository structure

```
app/            pages + API routes (App Router)
  api/          people · dates · match · cohort · jobs
components/     profile, transcript, verdict, ranking UI
lib/
  types.ts      shared contracts (single source of truth)
  db/           postgres.js client, helpers, schema.sql
  llm.ts        Gemini transport (retry/backoff/concurrency/usage)
  agents/       analyze · prescore · date · rank
fixtures/       4 day-zero fake people for instant UI
scripts/        migrate · seed · import · ingest · run-cohort
coord/          shared agent coordination (gitignored)
docs/           video-script.md
```

## Limits & assumptions

- Instagram-only analysis for now; confidence scores and `data_gaps` say so per
  profile rather than pretending otherwise.
- Free tiers throughout: Gemini rate limits are absorbed by retry/backoff and a
  small concurrency cap; Apify and Neon are on free plans. No credit cards.
- The new-person flow (paste links → profile → dates vs cohort → ranking) uses
  the same pipeline against the same DB.
- Private Instagrams and malformed URLs return clear errors — never crashes.

<div align="center">

Built by 3 parallel Claude Code sessions in a 3-hour sprint · MIT-style open repo

</div>
