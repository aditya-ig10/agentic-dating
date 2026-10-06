// Applies lib/db/schema.sql to the database.
// Usage: npx tsx scripts/migrate.ts   (requires DATABASE_URL)
import { db } from "../lib/db/client";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const sql = db();
  const schema = fs.readFileSync(path.join(__dirname, "..", "lib", "db", "schema.sql"), "utf8");
  await sql.unsafe(schema);
  console.log("schema applied");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
