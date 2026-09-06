import { NextRequest, NextResponse } from "next/server";
import { fetchChatHistory } from "../../../../lib/bus";

export const dynamic = "force-dynamic";

const SESSION_ID_PATTERN = /^[a-zA-Z0-9-]{1,64}$/;

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId || !SESSION_ID_PATTERN.test(sessionId)) {
    return NextResponse.json({ error: "invalid sessionId" }, { status: 400 });
  }

  const entries = await fetchChatHistory(sessionId);
  return NextResponse.json({ entries });
}
