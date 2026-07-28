import { getBus, SUBJECTS, durableConsumerOpts, sc } from "./bus";
import { executeIntent } from "./execute-intent";
import type { Intent } from "./semantic-firewall";

type QueuedIntent = { id: string; intent: Intent };

export const startBackgroundWorker = () => {
  const globalState = globalThis as unknown as { __repoOsWorkerStarted?: boolean };
  if (globalState.__repoOsWorkerStarted) return;
  globalState.__repoOsWorkerStarted = true;

  (async () => {
    const nc = await getBus();
    if (!nc) {
      console.warn("[worker] message bus unavailable — chat execution will report errors until nats-server is set up");
      return;
    }

    const js = nc.jetstream();
    const opts = durableConsumerOpts("repo-os-worker");
    opts.filterSubject(SUBJECTS.intentSubmit);

    const sub = await js.subscribe(SUBJECTS.intentSubmit, opts);
    console.log(`[worker] listening on ${SUBJECTS.intentSubmit}`);

    for await (const m of sub) {
      let payload: QueuedIntent | null = null;
      try {
        payload = JSON.parse(sc.decode(m.data)) as QueuedIntent;
        const result = await executeIntent(payload.intent);
        nc.publish(SUBJECTS.result(payload.id), sc.encode(JSON.stringify(result)));
      } catch (err) {
        if (payload) {
          nc.publish(SUBJECTS.result(payload.id), sc.encode(JSON.stringify({ ok: false, summary: `execution error: ${String(err)}` })));
        }
        console.error("[worker] failed to process intent", err);
      } finally {
        m.ack();
      }
    }
  })().catch((err) => console.error("[worker] consumer loop crashed", err));
};
