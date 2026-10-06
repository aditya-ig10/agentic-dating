// lib/api.ts — typed fetch helper for Agent C pages (Agent C owns this file).
// All calls use relative /api/* URLs so the same build works on Vercel
// and localhost with zero base-URL config.

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

export interface ApiPerson {
  id: string;
  name: string;
  linkedin_url: string;
  instagram_url: string;
  consent: boolean;
  status: "pending" | "scraped" | "analyzed" | "failed";
  error?: string | null;
  created_at: string;
}

export const api = {
  listPeople: () => req<ApiPerson[]>("/api/people"),
  getPerson: (id: string) => req<unknown>(`/api/people/${id}`),
  createPerson: (body: {
    linkedin_url: string;
    instagram_url: string;
    name?: string;
    consent: boolean;
  }) => req<ApiPerson>("/api/people", { method: "POST", body: JSON.stringify(body) }),
  ingestPerson: (id: string) =>
    req<ApiPerson>(`/api/people/${id}/ingest`, { method: "POST" }),
  getDates: (personId: string) =>
    req<unknown[]>(`/api/people/${personId}/dates`),
  getDate: (dateId: string) => req<unknown>(`/api/dates/${dateId}`),
  getRanking: (personId: string) =>
    req<unknown[]>(`/api/people/${personId}/ranking`),
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
