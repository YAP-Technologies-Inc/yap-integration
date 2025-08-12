// app/api/legal/[slug]/route.ts  (or src/app/...)
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isSafeSlug(s: string) {
  // lowercase letters, digits, dash, underscore (e.g., privacy, privacy-policy)
  return /^[a-z0-9_-]+$/.test(s);
}

async function tryRead(p: string) {
  try {
    return await fs.readFile(p, "utf8");
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;

  if (!isSafeSlug(slug)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const cwd = process.cwd();
  const contentDir = path.join(cwd, "content", "legal");
  const publicDir  = path.join(cwd, "public",  "legal");

  const p1 = path.join(contentDir, `${slug}.md`);
  const p2 = path.join(publicDir,  `${slug}.md`);

  const md = (await tryRead(p1)) ?? (await tryRead(p2));
  if (!md) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
