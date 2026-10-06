import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dates = await db()`SELECT * FROM dates WHERE a_id = ${id} OR b_id = ${id} ORDER BY created_at DESC`;
    const dateIds = (dates as unknown as { id: string }[]).map((d) => d.id);
    const verdicts =
      dateIds.length > 0
        ? await db()`SELECT * FROM verdicts WHERE date_id = ANY(${dateIds})`
        : [];
    return NextResponse.json({ dates, verdicts });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
