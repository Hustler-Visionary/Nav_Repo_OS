import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { evaluateIntent } from "../../../../lib/semantic-firewall";
import { getBus, SUBJECTS, sc, logChatEntry } from "../../../../lib/bus";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { text?: string; sessionId?: string; connectionId?: string } | null;
  const text = typeof body?.text === "string" ? body.text : "";
  const sessionId = typeof body?.sessionId === "string" && body.sessionId ? body.sessionId : null;
  const connectionId = typeof body?.connectionId === "string" && body.connectionId ? body.connectionId : null;

  const evaluation = evaluateIntent(text);
  const nc = await getBus();

  if (sessionId && nc) logChatEntry(nc, sessionId, { role: "user", text, at: new Date().toISOString() });

  if (!evaluation.allowed) {
    nc?.publish(SUBJECTS.audit, sc.encode(JSON.stringify({ text, reason: evaluation.reason, at: new Date().toISOString() })));
    if (sessionId && nc) logChatEntry(nc, sessionId, { role: "blocked", text: evaluation.reason, at: new Date().toISOString() });
    return NextResponse.json({ blocked: true, reason: evaluation.reason });
  }

  if (!nc) {
    const reason = "message bus unavailable — nats-server did not start";
    return NextResponse.json({ blocked: true, reason }, { status: 503 });
  }

  if (!connectionId) {
    return NextResponse.json({ blocked: true, reason: "missing connectionId" }, { status: 400 });
  }

  const id = randomUUID();
  const js = nc.jetstream();
  await js.publish(SUBJECTS.intentSubmit, sc.encode(JSON.stringify({ id, intent: evaluation.intent, sessionId, connectionId })));

  return NextResponse.json({ blocked: false, id, intent: evaluation.intent });
}
