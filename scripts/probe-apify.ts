// One-off probe: run candidate Apify actors on 2 test profiles to check
// output shape + cost before wiring ingestPerson.
// Usage: npx tsx scripts/probe-apify.ts   (requires APIFY_TOKEN)
import { ApifyClient } from "apify-client";

const IG_URLS = ["https://www.instagram.com/mkbhd/", "https://www.instagram.com/mostlysane/"];
const LI_URLS = ["https://www.linkedin.com/in/mkbhd/", "https://www.linkedin.com/in/prajakta-koli-5739a2187/"];

async function tryActor(client: ApifyClient, actorId: string, input: Record<string, unknown>) {
  console.log(`\n=== ${actorId} ===\ninput: ${JSON.stringify(input)}`);
  try {
    const run = await client.actor(actorId).call(input, { timeout: 180 });
    console.log(`status: ${run.status}, cost: ${run.stats?.computeUnits ?? "?"} CU`);
    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 2 });
    console.log(`items: ${items.length}`);
    if (items.length > 0) {
      const keys = Object.keys(items[0] as object);
      console.log(`keys: ${keys.slice(0, 30).join(",")}${keys.length > 30 ? "..." : ""}`);
      console.log(JSON.stringify(items[0]).slice(0, 1500));
    }
    return true;
  } catch (e) {
    console.log(`FAILED: ${(e as Error).message}`.slice(0, 500));
    return false;
  }
}

async function main() {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN not set");
  const client = new ApifyClient({ token });
  const me = await client.user().get();
  console.log(`apify user: ${me?.username}, plan: ${(me as Record<string, unknown> | undefined)?.plan as string ?? "?"}`);

  // Candidate Instagram actors (free-tier friendly, try in order)
  for (const actor of ["apify/instagram-profile-scraper", "apify/instagram-scraper"]) {
    if (await tryActor(client, actor, { usernames: [IG_URLS[0].split("/")[3]] })) break;
  }
  // Candidate LinkedIn actors (public profile, no-auth if possible)
  for (const actor of ["apify/linkedin-profile-scraper", "harvestapi/linkedin-profile-search"]) {
    if (await tryActor(client, actor, { profileUrls: LI_URLS.slice(0, 1) })) break;
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
