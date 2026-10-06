// Instagram ingest via Apify instagram-profile-scraper (proven: ~0.00013 CU/profile).
// LinkedIn is SKIPPED per orchestrator decision (cookie auth loops in headless;
// agenda fallback: mark data_gaps, never block pipeline).
// Usage: npx tsx scripts/ingest-cohort.ts [--limit N]
import { ApifyClient } from "apify-client";
import { db } from "../lib/db/client";

function usernameFromUrl(url: string): string {
  const m = url.replace(/\/+$/, "").match(/instagram\.com\/([^/?#]+)/);
  if (!m) throw new Error(`bad instagram url: ${url}`);
  return m[1];
}

async function main() {
  const limit = process.argv.includes("--limit")
    ? Number(process.argv[process.argv.indexOf("--limit") + 1])
    : Infinity;
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN not set");
  const sql = db();
  const people = await sql`
    SELECT * FROM people WHERE status = 'pending' ORDER BY created_at ASC LIMIT ${Number.isFinite(limit) ? limit : 1000}`;
  console.log(`ingesting ${people.length} pending people (IG only, LinkedIn skipped → data_gaps)`);

  const client = new ApifyClient({ token });
  let ok = 0, failed = 0;
  for (const p of people as unknown as { id: string; instagram_url: string; linkedin_url: string }[]) {
    try {
      const username = usernameFromUrl(p.instagram_url);
      const run = await client.actor("apify/instagram-profile-scraper").call(
        { usernames: [username] },
        { timeout: 240 }
      );
      if (run.status !== "SUCCEEDED") throw new Error(`actor status: ${run.status}`);
      const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 1 });
      if (items.length === 0) throw new Error("actor returned 0 items (private/empty profile?)");
      const ig = items[0];
      // Trim to what analysis needs (drop CDN pic URLs bulk, keep evidence-rich fields)
      const payload = {
        source_note: "instagram only; linkedin skipped (auth) — see data_gaps",
        linkedin_url: p.linkedin_url,
        username: (ig as Record<string, unknown>).username,
        fullName: (ig as Record<string, unknown>).fullName,
        biography: (ig as Record<string, unknown>).biography,
        followersCount: (ig as Record<string, unknown>).followersCount,
        followsCount: (ig as Record<string, unknown>).followsCount,
        postsCount: (ig as Record<string, unknown>).postsCount,
        verified: (ig as Record<string, unknown>).verified,
        private: (ig as Record<string, unknown>).private,
        externalUrl: (ig as Record<string, unknown>).externalUrl,
        latestPosts: ((ig as Record<string, unknown>).latestPosts as unknown[] ?? []).slice(0, 12).map((post) => {
          const r = post as Record<string, unknown>;
          return { caption: r.caption, likesCount: r.likesCount, commentsCount: r.commentsCount, timestamp: r.timestamp, url: r.url };
        }),
      };
      await sql`
        INSERT INTO raw_scrapes (person_id, source, payload)
        VALUES (${p.id}, 'instagram', ${sql.json(JSON.parse(JSON.stringify(payload)))})
        ON CONFLICT (person_id, source) DO UPDATE SET payload = EXCLUDED.payload, fetched_at = now()`;
      await sql`UPDATE people SET status = 'scraped', error = NULL WHERE id = ${p.id}`;
      ok++;
      console.log(`ok ${ok}/${people.length}: ${username} (${payload.postsCount} posts)`);
    } catch (e) {
      failed++;
      const msg = (e as Error).message.slice(0, 300);
      await sql`UPDATE people SET status = 'failed', error = ${msg} WHERE id = ${p.id}`;
      console.log(`FAILED ${(p as { instagram_url: string }).instagram_url}: ${msg}`);
    }
  }
  console.log(`done: ok=${ok} failed=${failed}`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
