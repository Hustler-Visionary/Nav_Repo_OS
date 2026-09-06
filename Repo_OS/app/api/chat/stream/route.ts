import { NextRequest } from "next/server";
import { getBus, SUBJECTS, sc, STREAM_NAME } from "../../../../lib/bus";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const connectionId = request.nextUrl.searchParams.get("connectionId");
  const nc = await getBus();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      send("ready", { ok: true, busOnline: Boolean(nc) });

      if (!nc) {
        send("bus_offline", { reason: "nats-server did not start" });
        controller.close();
        return;
      }

      if (!connectionId) {
        send("bus_offline", { reason: "missing connectionId" });
        controller.close();
        return;
      }

      // Scoped to this tab's own connectionId so one browser's SSE stream
      // never receives another tab's search/read/execute results. A durable
      // JetStream consumer (not a plain core-NATS subscribe) is used here so
      // a result published in the gap between intent submission and this
      // subscription being fully established -- or during a brief SSE
      // reconnect -- is still delivered from the stream instead of lost.
      // No explicit deliver_policy: the ordered-consumer builder in this
      // client version rejects DeliverPolicy.All combined with its own
      // opt_start_seq, but its default (StartSequence from seq 1) already
      // means "everything retained for this subject".
      const js = nc.jetstream();
      const resultConsumer = await js.consumers.get(STREAM_NAME, {
        filterSubjects: SUBJECTS.resultWildcardFor(connectionId)
      });
      const resultMessages = await resultConsumer.consume();
      const auditSub = nc.subscribe(SUBJECTS.auditWildcard);

      request.signal.addEventListener("abort", () => {
        resultMessages.close();
        auditSub.unsubscribe();
        controller.close();
      });

      const pumpResults = (async () => {
        for await (const m of resultMessages) {
          const intentId = m.subject.split(".").pop();
          send("result", { intentId, payload: JSON.parse(sc.decode(m.data)) });
        }
      })();

      const pumpAudit = (async () => {
        for await (const m of auditSub) {
          send("blocked", JSON.parse(sc.decode(m.data)));
        }
      })();

      await Promise.all([pumpResults, pumpAudit]);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
