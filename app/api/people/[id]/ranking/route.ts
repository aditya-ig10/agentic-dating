import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await db()`
      SELECT r.*, p.name AS candidate_name
      FROM rankings r JOIN people p ON p.id = r.candidate_id
      WHERE r.person_id = ${id} ORDER BY r.rank ASC`;
    return NextResponse.json({ ranking: rows });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
