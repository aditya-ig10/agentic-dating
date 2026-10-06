# Agentic Dating — send your agent out dating

Paste a LinkedIn and a public Instagram. An AI agent reads only those two
sources, builds your profile (needs, hobbies, interests, values, evidence,
confidence), goes on real multi-turn first dates with other agents, then ranks
your best matches.

Live site: https://agentic-dating-8nsr1lqyx-aditya-ig10s-projects.vercel.app
Demo (finished example, loads instantly): `/demo`

## How it works

```
URLs → scrape (Apify) → raw_scrapes → analyze (Gemini JSON) → profile
     → pair pre-score (all pairs, cheap) → top 3–4 candidates per person
     → full agent-vs-agent dates (6–8 turns + 2 verdicts)
     → ranking = 70% date verdicts + 30% pre-score
```

Each date is a real conversation: persona prompts built from each person's
analysis (voice, interests, needs, dealbreakers), alternating turns with a
natural opening, curiosity, one probing moment, and a close. Afterwards each
agent writes a structured verdict from its person's point of view
(`score 0–100`, `chemistry`, `red_flags[]`, `would_meet_again`, `note`).
Agents never fabricate facts outside the analysis — when unsure they stay
vague or ask.

## Stack

Next.js (App Router, TS) + Tailwind on Vercel · Postgres (Neon) via
`postgres.js` · Apify actors for scraping, every result cached in
`raw_scrapes` and never re-scraped · Gemini (`GEMINI_MODEL`) for everything
LLM: analysis JSON, pre-scores, date turns, verdicts — with retry/backoff and
a small concurrency cap.

## Scraping approach (technical section)

- **Instagram**: Apify actor over public profiles (posts, captions, bio).
  Tested on 2 profiles for cost, then batched across the cohort.
- **LinkedIn**: skipped — headless cookie auth redirect-loops (`li_at`
  rejected outside real browsers; logged-out loads hit the authwall). Per
  AGENDA §7 fallback: payloads are Instagram-only + the public headline URL,
  every analysis marks
  `data_gaps: ["linkedin unavailable — instagram + public headline only"]`,
  and the pipeline never blocks on the missing source.
- Only public data, only consenting people (consent flag per row; the demo
  cohort is public figures, labeled public-data-only in the UI). Raw payloads
  live in `data/raw/` (gitignored) and Postgres — never in the repo. No
  sensitive attributes are inferred or displayed; the analysis prompt bans
  them explicitly.

## Run it

```bash
npm install
cp coord/.env.local .env.local   # DATABASE_URL, APIFY_TOKEN, GEMINI_API_KEY, GEMINI_MODEL
npm run dev
```

Seed fixtures: `npx tsx scripts/seed.ts`. Full cohort locally (avoids
serverless timeouts): `npx tsx scripts/run-cohort.ts`.

## Limits & assumptions

- Instagram-only analysis until LinkedIn scraping is viable; confidence
  scores and data gaps say so honestly per profile.
- New-person flow (paste links → profile → dates vs cohort → ranking) works
  against the same pipeline; each API route does one small unit of work and
  long runs are chunked via `/run` or `run-cohort.ts`.
- Private Instagrams and malformed URLs get clear errors, never crashes.
