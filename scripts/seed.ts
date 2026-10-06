// Seeds the DB with the 4 day-zero fixtures (AGENDA §4).
// Usage: npx tsx scripts/seed.ts   (requires DATABASE_URL)
import { db } from "../lib/db/client";
import { fixturePeople, fixtureAnalyses, fixtureTranscript, fixtureVerdicts, fixtureDateId, fixtureRanking } from "../fixtures/people";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const sql = db();
  const schemaPath = path.join(__dirname, "..", "lib", "db", "schema.sql");
  await sql.unsafe(fs.readFileSync(schemaPath, "utf8"));

  for (const p of fixturePeople) {
    await sql`
      INSERT INTO people (id, name, linkedin_url, instagram_url, consent, status)
      VALUES (${p.id}, ${p.name}, ${p.linkedin_url}, ${p.instagram_url}, ${p.consent}, ${p.status})
      ON CONFLICT (id) DO UPDATE SET name = ${p.name}, status = ${p.status}`;
    const analysis = JSON.parse(JSON.stringify(fixtureAnalyses[p.id]));
    await sql`
      INSERT INTO profiles (person_id, analysis, summary)
      VALUES (${p.id}, ${sql.json(analysis)}, ${analysis.summary})
      ON CONFLICT (person_id) DO UPDATE SET analysis = ${sql.json(analysis)}, summary = ${analysis.summary}`;
  }

  const [a, b] = [fixturePeople[0], fixturePeople[1]];
  const transcript = JSON.parse(JSON.stringify(fixtureTranscript));
  await sql`
    INSERT INTO dates (id, a_id, b_id, status, transcript)
    VALUES (${fixtureDateId}, ${a.id}, ${b.id}, 'done', ${sql.json(transcript)})
    ON CONFLICT (id) DO UPDATE SET status = 'done', transcript = ${sql.json(transcript)}`;
  for (const v of fixtureVerdicts) {
    await sql`
      INSERT INTO verdicts (date_id, from_person_id, score, chemistry, red_flags, would_meet_again, note)
      VALUES (${v.date_id}, ${v.from_person_id}, ${v.score}, ${v.chemistry}, ${sql.json(v.red_flags)}, ${v.would_meet_again}, ${v.note})
      ON CONFLICT (date_id, from_person_id) DO UPDATE SET score = ${v.score}, chemistry = ${v.chemistry}, would_meet_again = ${v.would_meet_again}, note = ${v.note}`;
  }
  for (const r of fixtureRanking) {
    await sql`
      INSERT INTO rankings (person_id, candidate_id, rank, final_score, why)
      VALUES (${r.person_id}, ${r.candidate_id}, ${r.rank}, ${r.final_score}, ${r.why})
      ON CONFLICT (person_id, candidate_id) DO UPDATE SET rank = ${r.rank}, final_score = ${r.final_score}, why = ${r.why}`;
  }

  console.log(`seeded ${fixturePeople.length} fixture people + 1 date + verdicts + ranking`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
