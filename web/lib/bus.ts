import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import {
  connect,
  StringCodec,
  consumerOpts,
  AckPolicy,
  DeliverPolicy,
  StorageType,
  type NatsConnection,
  type JsMsg
} from "nats";

const WEB_ROOT = process.cwd();
const BIN_PATH = path.join(WEB_ROOT, ".nats-bin", "nats-server");
const DATA_DIR = path.join(WEB_ROOT, ".nats-data");
const PORT = 4222;

export const STREAM_NAME = "REPO_OS_BUS";
export const SUBJECTS = {
  intentSubmit: "repo.intent.submit",
  result: (intentId: string) => `repo.result.${intentId}`,
  resultWildcard: "repo.result.>",
  audit: "repo.audit.blocked",
  auditWildcard: "repo.audit.>"
};

export const sc = StringCodec();

type BusState = {
  proc?: ChildProcess;
  nc?: NatsConnection;
  starting?: Promise<NatsConnection | null>;
};

const globalState = globalThis as unknown as { __repoOsBus?: BusState };
const state: BusState = (globalState.__repoOsBus ??= {});

const startServerProcess = (): ChildProcess => {
  mkdirSync(DATA_DIR, { recursive: true });
  const proc = spawn(BIN_PATH, ["-js", "-p", String(PORT), "-sd", DATA_DIR], { stdio: "pipe" });
  proc.stdout?.on("data", (d) => process.stdout.write(`[nats-server] ${d}`));
  proc.stderr?.on("data", (d) => process.stderr.write(`[nats-server] ${d}`));
  proc.on("exit", (code) => {
    console.warn(`[nats-server] exited with code ${code}`);
    if (state.proc === proc) state.proc = undefined;
    if (state.nc) state.nc = undefined;
  });
  return proc;
};

const waitForConnect = async (retries = 30): Promise<NatsConnection> => {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await connect({ servers: `127.0.0.1:${PORT}`, timeout: 1500 });
    } catch (err) {
      lastErr = err;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("nats connection timeout");
};

const ensureStream = async (nc: NatsConnection) => {
  const jsm = await nc.jetstreamManager();
  try {
    await jsm.streams.info(STREAM_NAME);
  } catch {
    await jsm.streams.add({
      name: STREAM_NAME,
      subjects: ["repo.intent.>", "repo.result.>", "repo.audit.>"],
      storage: StorageType.File,
      max_age: 24 * 60 * 60 * 1_000_000_000
    });
  }
};

/** Connects to the local JetStream bus, spawning the self-hosted nats-server if needed. Returns null if the binary is missing. */
export const getBus = async (): Promise<NatsConnection | null> => {
  if (state.nc) return state.nc;
  if (state.starting) return state.starting;

  state.starting = (async () => {
    if (!existsSync(BIN_PATH)) {
      console.warn(`[bus] nats-server binary not found at ${BIN_PATH}. Run: node scripts/setup-nats.mjs`);
      return null;
    }
    if (!state.proc) {
      state.proc = startServerProcess();
    }
    const nc = await waitForConnect();
    await ensureStream(nc);
    state.nc = nc;
    return nc;
  })();

  const nc = await state.starting;
  state.starting = undefined;
  return nc;
};

export const durableConsumerOpts = (durableName: string) =>
  consumerOpts()
    .durable(durableName)
    .manualAck()
    .ackExplicit()
    .deliverTo(`${durableName}.deliver`)
    .deliverAll();

export type { JsMsg };
export { AckPolicy, DeliverPolicy };
