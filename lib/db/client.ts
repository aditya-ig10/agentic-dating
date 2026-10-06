// Lazy singleton postgres.js client. Import from API routes and scripts.
// Requires DATABASE_URL. Never import this from client components.
import postgres from "postgres";

let sql: postgres.Sql | null = null;

export function db(): postgres.Sql {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    sql = postgres(url, { max: 5 });
  }
  return sql;
}
