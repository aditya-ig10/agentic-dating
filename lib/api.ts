// lib/api.ts — typed fetch helper for Agent C pages (Agent C owns this file).
// All calls use relative /api/* URLs so the same build works on Vercel
// and localhost with zero base-URL config.
// Response shapes mirror Agent A's routes exactly:
//   GET /api/people -> { people }
//   POST /api/people -> { person } (201)
//   GET /api/people/:id -> { person, profile, ranking_preview }
//   GET /api/people/:id/dates -> { dates, verdicts }
//   GET /api/dates/:id -> { date, verdicts }
//   GET /api/people/:id/ranking -> { ranking }
import type {
  Person,
  Profile,
  RankingEntry,
  DateWithVerdicts,
  Verdict,
} from "./types";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.error ?? body.message ?? detail;
    } catch {
      /* keep statusText */
    }
    throw new Error(`${res.status} ${detail}`);
  }
  return (await res.json()) as T;
}

export type { Person, Profile, RankingEntry, DateWithVerdicts, Verdict };

export interface PersonWithProfile {
  person: Person;
  profile: Profile | null;
  ranking_preview: RankingEntry[];
}

export interface PersonDates {
  dates: DateWithVerdicts[];
  verdicts: Verdict[];
}

export interface DateDetail {
  date: DateWithVerdicts;
  verdicts: Verdict[];
}

export interface PersonRanking {
  ranking: (RankingEntry & { candidate_name: string })[];
}

export const api = {
  listPeople: () =>
    req<{ people: Person[] }>("/api/people").then((r) => r.people),
  getPerson: (id: string) =>
    req<PersonWithProfile>(`/api/people/${id}`),
  createPerson: (body: {
    linkedin_url: string;
    instagram_url: string;
    name?: string;
    consent: boolean;
  }) =>
    req<{ person: Person }>("/api/people", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((r) => r.person),
  getDates: (personId: string) =>
    req<PersonDates>(`/api/people/${personId}/dates`),
  getDate: (dateId: string) => req<DateDetail>(`/api/dates/${dateId}`),
  getRanking: (personId: string) =>
    req<PersonRanking>(`/api/people/${personId}/ranking`).then(
      (r) => r.ranking,
    ),
  matchPerson: (id: string) => req<unknown>(`/api/match/${id}`, { method: "POST" }),
  runCohort: () => req<unknown>("/api/cohort/run", { method: "POST" }),
  getJob: (jobId: string) => req<unknown>(`/api/jobs/${jobId}`),
};

/** True when a string looks like an http(s) URL. Used for form validation. */
export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
