// Bulk-imports a CSV of `name,linkedin_url,instagram_url,consent` into people.
// Skips rows whose linkedin_url already exists (idempotent re-runs).
// Usage: npx tsx scripts/import-people.ts [path/to/people.csv]   (requires DATABASE_URL)
// Default path: ../agentic-dating-coord/people.csv
import { db } from "../lib/db/client";
import * as fs from "fs";
import * as path from "path";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (field !== "" || row.length > 0) { row.push(field); rows.push(row); row = []; field = ""; }
      if (c === "\r" && text[i + 1] === "\n") i++;
    } else field += c;
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

async function main() {
  const csvPath = process.argv[2] ?? path.join(__dirname, "..", "coord", "people.csv");
  const text = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(text);
  const header = rows[0].map((h) => h.trim());
  const need = ["name", "linkedin_url", "instagram_url", "consent"];
  for (const col of need) {
    if (!header.includes(col)) throw new Error(`CSV missing column: ${col} (header: ${header.join(",")})`);
  }
  const idx = (c: string) => header.indexOf(c);
  const sql = db();
  let inserted = 0, skipped = 0;
  for (const r of rows.slice(1)) {
    if (r.every((f) => f.trim() === "")) continue;
    const name = r[idx("name")].trim();
    const linkedin_url = r[idx("linkedin_url")].trim();
    const instagram_url = r[idx("instagram_url")].trim();
    const consent = r[idx("consent")].trim().toLowerCase() === "true";
    if (!name || !linkedin_url || !instagram_url) { console.log(`skip (missing field): ${name || "?"}`); skipped++; continue; }
    const existing = await sql`SELECT id FROM people WHERE linkedin_url = ${linkedin_url}`;
    if (existing.length > 0) { skipped++; continue; }
    await sql`INSERT INTO people (name, linkedin_url, instagram_url, consent) VALUES (${name}, ${linkedin_url}, ${instagram_url}, ${consent})`;
    inserted++;
  }
  console.log(`imported ${inserted}, skipped ${skipped} (dupes/invalid)`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
