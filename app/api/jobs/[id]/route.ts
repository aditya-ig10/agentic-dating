// GET /api/jobs/:id — job progress (Agent B).
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = (await db()`SELECT * FROM jobs WHERE id = ${id}`) as unknown as Record<string, unknown>[];
    if (rows.length === 0) return NextResponse.json({ error: 'job not found' }, { status: 404 });
    return NextResponse.json({ job: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
