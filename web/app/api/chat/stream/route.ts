import { NextRequest } from "next/server";
import { getBus, SUBJECTS, sc } from "../../../../lib/bus";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

      const resultSub = nc.subscribe(SUBJECTS.resultWildcard);
      const auditSub = nc.subscribe(SUBJECTS.auditWildcard);

      request.signal.addEventListener("abort", () => {
        resultSub.unsubscribe();
        auditSub.unsubscribe();
        controller.close();
      });

      const pumpResults = (async () => {
        for await (const m of resultSub) {
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
