import { NextRequest, NextResponse } from "next/server";
import { buildUiPreviewSample } from "../../../lib/ui-preview-samples";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const relPath = request.nextUrl.searchParams.get("path");
  if (!relPath || !relPath.startsWith("src/components/")) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }

  const sample = buildUiPreviewSample(relPath);
  if (!sample) {
    return NextResponse.json({ error: "no preview available for this path" }, { status: 404 });
  }

  return NextResponse.json(sample);
}
