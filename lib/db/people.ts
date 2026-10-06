// Agent A data-access helpers (AGENDA §4 module boundary).
// B's agents code may call: getPerson, listPeople, saveProfile.
import { db } from "./client";
import type { Person, Profile, Analysis } from "../types";

export async function getPerson(personId: string): Promise<Person | null> {
  const rows = await db()`SELECT * FROM people WHERE id = ${personId}`;
  return ((rows as unknown[])[0] as Person | undefined) ?? null;
}

export async function listPeople(): Promise<Person[]> {
  const rows = await db()`SELECT * FROM people ORDER BY created_at ASC`;
  return rows as unknown as Person[];
}

export async function createPerson(input: {
  name: string;
  linkedin_url: string;
  instagram_url: string;
  consent?: boolean;
}): Promise<Person> {
  const rows = await db()`
    INSERT INTO people (name, linkedin_url, instagram_url, consent)
    VALUES (${input.name}, ${input.linkedin_url}, ${input.instagram_url}, ${input.consent ?? false})
    RETURNING *`;
  return (rows as unknown as Person[])[0];
}

export async function setPersonStatus(
  personId: string,
  status: Person["status"],
  error: string | null = null
): Promise<void> {
  await db()`UPDATE people SET status = ${status}, error = ${error} WHERE id = ${personId}`;
}

export async function saveProfile(personId: string, analysis: Analysis): Promise<Profile> {
  const payload = JSON.parse(JSON.stringify(analysis));
  const rows = await db()`
    INSERT INTO profiles (person_id, analysis, summary)
    VALUES (${personId}, ${db().json(payload)}, ${analysis.summary})
    ON CONFLICT (person_id) DO UPDATE SET analysis = ${db().json(payload)}, summary = ${analysis.summary}
    RETURNING *`;
  return (rows as unknown as Profile[])[0];
}

export async function getProfile(personId: string): Promise<Profile | null> {
  const rows = await db()`SELECT * FROM profiles WHERE person_id = ${personId}`;
  return ((rows as unknown[])[0] as Profile | undefined) ?? null;
}

export async function getRawScrapes(
  personId: string
): Promise<{ source: string; payload: unknown }[]> {
  const rows = await db()`SELECT source, payload FROM raw_scrapes WHERE person_id = ${personId}`;
  return rows as unknown as { source: string; payload: unknown }[];
}
