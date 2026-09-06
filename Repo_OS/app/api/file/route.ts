import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { readNodeSource } from "../../../lib/graph";
import { REPO_ROOT, DOMAIN_SCAN_DIR, UI_SCAN_DIR } from "../../../lib/repo-config";

export const dynamic = "force-dynamic";

const DOMAIN_ROOT = path.resolve(REPO_ROOT, DOMAIN_SCAN_DIR);
const UI_ROOT = path.resolve(REPO_ROOT, UI_SCAN_DIR);

/** True if `abs` is `root` itself or a descendant of it -- resolved/normalized, so `..` segments can't escape. */
const isWithin = (root: string, abs: string) => abs === root || abs.startsWith(root + path.sep);

export async function GET(request: NextRequest) {
  const relPath = request.nextUrl.searchParams.get("path");
  if (!relPath) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }
  const abs = path.resolve(REPO_ROOT, relPath);
  if (!(isWithin(DOMAIN_ROOT, abs) || isWithin(UI_ROOT, abs))) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }
  try {
    const content = await readNodeSource(relPath);
    return NextResponse.json({ path: relPath, content });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
