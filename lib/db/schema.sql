-- Agentic dating schema (AGENDA §4). Applied via scripts/migrate.ts.
-- Only Agent A edits this file.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  instagram_url TEXT NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','scraped','analyzed','failed')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS raw_scrapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('linkedin','instagram')),
  payload JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (person_id, source)
);

CREATE TABLE IF NOT EXISTS profiles (
  person_id UUID PRIMARY KEY REFERENCES people(id) ON DELETE CASCADE,
  analysis JSONB NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pair_scores (
  a_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  b_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  score DOUBLE PRECISION NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (a_id, b_id),
  CHECK (a_id <> b_id)
);

CREATE TABLE IF NOT EXISTS dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  a_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  b_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','running','done','failed')),
  transcript JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verdicts (
  date_id UUID NOT NULL REFERENCES dates(id) ON DELETE CASCADE,
  from_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  score DOUBLE PRECISION NOT NULL,
  chemistry TEXT NOT NULL DEFAULT 'none'
    CHECK (chemistry IN ('none','low','warm','strong')),
  red_flags JSONB NOT NULL DEFAULT '[]',
  would_meet_again BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (date_id, from_person_id)
);

CREATE TABLE IF NOT EXISTS rankings (
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  final_score DOUBLE PRECISION NOT NULL,
  why TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (person_id, candidate_id),
  CHECK (person_id <> candidate_id)
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','running','done','failed')),
  progress DOUBLE PRECISION NOT NULL DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_raw_scrapes_person ON raw_scrapes(person_id);
CREATE INDEX IF NOT EXISTS idx_dates_pair ON dates(a_id, b_id);
CREATE INDEX IF NOT EXISTS idx_rankings_person ON rankings(person_id);
