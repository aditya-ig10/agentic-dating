// LinkedIn profile scraper via Playwright + LI_AT_COOKIE session.
// Extracts public-profile content: headline, about, experience, education, posts.
// Usage: npx tsx scripts/scrape-linkedin.ts <personId|linkedin_url>
import { chromium } from "playwright";
import * as fs from "fs";

function getCookie(): string {
  const direct = process.env.LI_AT_COOKIE;
  if (direct) return direct.trim();
  for (const p of ["./coord/.env.local", "./.env.local"]) {
    try {
      const env = fs.readFileSync(p, "utf8");
      const m = env.match(/^LI_AT_COOKIE=(.+)$/m);
      if (m) return m[1].trim();
    } catch { /* try next */ }
  }
  throw new Error("LI_AT_COOKIE not set");
}

export interface LinkedInScrape {
  url: string;
  name: string | null;
  headline: string | null;
  about: string | null;
  experience: { title: string; company: string; detail: string }[];
  education: { school: string; detail: string }[];
  fetched_at: string;
}

export async function scrapeLinkedIn(url: string): Promise<LinkedInScrape> {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
    });
    await ctx.addCookies([{ name: "li_at", value: getCookie(), domain: ".linkedin.com", path: "/" }]);
    const page = await ctx.newPage();
    // Go via /feed/ first: establishes the session, avoids the /in/ redirect loop.
    await page.goto("https://www.linkedin.com/feed/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(4000);
    if (page.url().includes("/login") || page.url().includes("/checkpoint") || page.url().includes("/authwall")) {
      throw new Error("LinkedIn session rejected (login wall) — LI_AT_COOKIE may be expired");
    }
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(6000);
    if (page.url().includes("/login") || page.url().includes("/checkpoint")) {
      throw new Error("LinkedIn session rejected (login wall) — LI_AT_COOKIE may be expired");
    }
    const data = await page.evaluate(() => {
      const text = (sel: string): string | null => {
        const els = Array.from(document.querySelectorAll(sel));
        return els.length > 0 ? (els[0].textContent ?? "").trim() || null : null;
      };
      const main = document.querySelector("main");
      const mainText = main ? (main.innerText ?? "") : document.body.innerText ?? "";
      const name = text("main h1, h1.top-card-layout__title, h1");
      // Experience: section with id="experience" — grab list items' text
      const expSection = document.getElementById("experience")?.parentElement ?? document.getElementById("experience");
      const expItems = expSection
        ? Array.from(expSection.querySelectorAll("li")).slice(0, 8).map((li) =>
            (li.innerText ?? "").trim().split("\n").filter(Boolean).slice(0, 4).join(" | ").slice(0, 300)
          ).filter(Boolean)
        : [];
      const eduSection = document.getElementById("education")?.parentElement ?? document.getElementById("education");
      const eduItems = eduSection
        ? Array.from(eduSection.querySelectorAll("li")).slice(0, 4).map((li) =>
            (li.innerText ?? "").trim().split("\n").filter(Boolean).slice(0, 3).join(" | ").slice(0, 200)
          ).filter(Boolean)
        : [];
      return { name, mainText: mainText.slice(0, 12000), expItems, eduItems, title: document.title };
    });
    // Headline ≈ first line of <title> "Name | LinkedIn" → use title + first chunk of main text
    const lines = data.mainText.split("\n").map((l) => l.trim()).filter(Boolean);
    return {
      url,
      name: data.name,
      headline: data.title.replace(/\s*\|\s*LinkedIn\s*$/, "") || null,
      about: lines.slice(0, 40).join("\n").slice(0, 4000) || null,
      experience: data.expItems.map((e) => {
        const [title, company, ...rest] = e.split(" | ");
        return { title: title ?? "", company: company ?? "", detail: rest.join(" | ") };
      }),
      education: data.eduItems.map((e) => {
        const [school, ...rest] = e.split(" | ");
        return { school: school ?? "", detail: rest.join(" | ") };
      }),
      fetched_at: new Date().toISOString(),
    };
  } finally {
    await browser.close();
  }
}

// CLI: scrape one URL, print JSON
if (process.argv[1]?.endsWith("scrape-linkedin.ts")) {
  const url = process.argv[2];
  if (!url) { console.error("usage: scrape-linkedin.ts <linkedin_url>"); process.exit(1); }
  scrapeLinkedIn(url).then((d) => { console.log(JSON.stringify(d, null, 2).slice(0, 6000)); })
    .catch((e) => { console.error("SCRAPE-FAILED:", e.message); process.exit(2); });
}
