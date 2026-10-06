import { NextResponse } from "next/server";
import { createPerson, listPeople, getPerson, getProfile } from "@/lib/db/people";

function isValidUrl(u: string): boolean {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const people = await listPeople();
    return NextResponse.json({ people });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { linkedin_url, instagram_url, name, consent } = body ?? {};
    if (!linkedin_url || !instagram_url) {
      return NextResponse.json({ error: "linkedin_url and instagram_url are required" }, { status: 400 });
    }
    if (!isValidUrl(linkedin_url) || !isValidUrl(instagram_url)) {
      return NextResponse.json({ error: "both URLs must be valid https URLs" }, { status: 400 });
    }
    if (!linkedin_url.includes("linkedin.com") || !instagram_url.includes("instagram.com")) {
      return NextResponse.json(
        { error: "linkedin_url must be a linkedin.com URL and instagram_url an instagram.com URL" },
        { status: 400 }
      );
    }
    const person = await createPerson({
      name: (name as string)?.trim() || new URL(instagram_url).pathname.replace(/\//g, "") || "New person",
      linkedin_url,
      instagram_url,
      consent: Boolean(consent),
    });
    return NextResponse.json({ person }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function getPersonWithProfile(id: string) {
  const person = await getPerson(id);
  if (!person) return null;
  const profile = await getProfile(id);
  return { person, profile };
}
