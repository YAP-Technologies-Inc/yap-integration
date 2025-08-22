// app/api/lesson-catalog/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getLessonCatalog } from '@/lib/lessonCatalog';

export async function GET() {
  try {
    const groups = await getLessonCatalog();
    return NextResponse.json({ groups });
  } catch (e) {
    console.error('[api/lesson-catalog] error', e);
    return NextResponse.json({ error: 'failed to load' }, { status: 500 });
  }
}
