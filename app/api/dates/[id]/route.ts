import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dates = await db()`SELECT * FROM dates WHERE id = ${id}`;
    if (dates.length === 0) return NextResponse.json({ error: "date not found" }, { status: 404 });
    const verdicts = await db()`SELECT * FROM verdicts WHERE date_id = ${id}`;
    return NextResponse.json({ date: dates[0], verdicts });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
