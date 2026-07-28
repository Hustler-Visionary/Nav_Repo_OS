import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { evaluateIntent } from "../../../../lib/semantic-firewall";
import { getBus, SUBJECTS, sc } from "../../../../lib/bus";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { text?: string } | null;
  const text = typeof body?.text === "string" ? body.text : "";

  const evaluation = evaluateIntent(text);

  if (!evaluation.allowed) {
    const nc = await getBus();
    nc?.publish(SUBJECTS.audit, sc.encode(JSON.stringify({ text, reason: evaluation.reason, at: new Date().toISOString() })));
    return NextResponse.json({ blocked: true, reason: evaluation.reason });
  }

  const nc = await getBus();
  if (!nc) {
    return NextResponse.json({ blocked: true, reason: "message bus unavailable — nats-server did not start" }, { status: 503 });
  }

  const id = randomUUID();
  const js = nc.jetstream();
  await js.publish(SUBJECTS.intentSubmit, sc.encode(JSON.stringify({ id, intent: evaluation.intent })));

  return NextResponse.json({ blocked: false, id, intent: evaluation.intent });
}
