// Shared helpers for Agent B's long-work routes (match + cohort).
// Job rows let /run poll progress; each route call does one small unit of work.
import { db } from '@/lib/db/client';

export async function createJob(type: string): Promise<string> {
  const rows = (await db()`INSERT INTO jobs (type, status, progress) VALUES (${type}, 'running', 0) RETURNING id`) as unknown as {
    id: string;
  }[];
  return rows[0].id;
}

export async function updateJob(id: string, progress: number): Promise<void> {
  await db()`UPDATE jobs SET progress = ${progress} WHERE id = ${id}`;
}

export async function finishJob(id: string, error: string | null = null): Promise<void> {
  await db()`UPDATE jobs SET status = ${error ? 'failed' : 'done'}, progress = 1, error = ${error} WHERE id = ${id}`;
}
