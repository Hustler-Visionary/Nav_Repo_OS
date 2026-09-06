import { NextRequest, NextResponse } from "next/server";
import { readNodeSource } from "../../../lib/graph";
import { DOMAIN_SCAN_DIR, UI_SCAN_DIR } from "../../../lib/repo-config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const relPath = request.nextUrl.searchParams.get("path");
  if (!relPath || !(relPath.startsWith(`${DOMAIN_SCAN_DIR}/`) || relPath.startsWith(`${UI_SCAN_DIR}/`))) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }
  try {
    const content = await readNodeSource(relPath);
    return NextResponse.json({ path: relPath, content });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
