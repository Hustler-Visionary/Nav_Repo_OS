import { NextResponse } from "next/server";
import { buildUiPreviewSample, UI_PREVIEW_PATHS } from "../../../../lib/ui-preview-samples";

export const dynamic = "force-dynamic";

export async function GET() {
  const samples: Record<string, { kind: string; data: unknown }> = {};
  for (const path of UI_PREVIEW_PATHS) {
    const sample = buildUiPreviewSample(path);
    if (sample) samples[path] = sample;
  }
  return NextResponse.json({ samples });
}
