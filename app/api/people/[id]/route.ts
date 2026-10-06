import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const people = await db()`SELECT * FROM people WHERE id = ${id}`;
    if (people.length === 0) return NextResponse.json({ error: "person not found" }, { status: 404 });
    const profiles = await db()`SELECT * FROM profiles WHERE person_id = ${id}`;
    const ranks = await db()`SELECT * FROM rankings WHERE person_id = ${id} ORDER BY rank ASC`;
    return NextResponse.json({ person: people[0], profile: profiles[0] ?? null, ranking_preview: ranks });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
