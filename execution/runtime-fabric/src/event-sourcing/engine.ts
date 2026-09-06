import { createHash } from "node:crypto";
import type {
  AuditLedger,
  EventEnvelope,
  EventProjection,
  EventStore,
  EventStream,
  LedgerEntry,
  RetentionCursor,
  SnapshotStore
} from "./types.js";

const hash = (value: string): string => createHash("sha256").update(value).digest("hex");

export const initializeEventStore = (): EventStore => ({ streams: [], ledger: { entries: [] } });

export const createTenantStream = (store: EventStore, tenantId: string, streamId: string): EventStore => {
  const exists = store.streams.some((stream) => stream.tenantId === tenantId && stream.streamId === streamId);
  if (exists) return store;
  return { ...store, streams: [...store.streams, { tenantId, streamId, events: [] }] };
};

export const verifyEventEnvelope = (event: EventEnvelope): boolean =>
  Boolean(event.id && event.tenantId && event.streamId && event.type && event.idempotencyKey);

export const verifyIdempotency = (stream: EventStream, idempotencyKey: string): boolean =>
  !stream.events.some((event) => event.idempotencyKey === idempotencyKey);

export const verifyCausalOrder = (stream: EventStream, order: number): boolean => {
  const expected = stream.events.length === 0 ? 1 : stream.events[stream.events.length - 1]!.causalOrder + 1;
  return order === expected;
};

const appendLedgerEntry = (ledger: AuditLedger, event: EventEnvelope): AuditLedger => {
  const prev = ledger.entries[ledger.entries.length - 1];
  const prevHash = prev ? prev.hash : "GENESIS";
  const index = ledger.entries.length;
  const nextHash = hash(`${index}:${event.id}:${event.tenantId}:${event.streamId}:${prevHash}:${event.timestamp}`);
  const entry: LedgerEntry = { index, eventId: event.id, tenantId: event.tenantId, streamId: event.streamId, prevHash, hash: nextHash, timestamp: event.timestamp };
  return { entries: [...ledger.entries, entry] };
};

export const appendEvent = (store: EventStore, event: EventEnvelope): { store: EventStore; accepted: boolean; reason: string } => {
  if (!verifyEventEnvelope(event)) return { store, accepted: false, reason: "event_append_rejected" };
  const stream = store.streams.find((candidate) => candidate.tenantId === event.tenantId && candidate.streamId === event.streamId);
  if (!stream) return { store, accepted: false, reason: "tenant_stream_isolated" };
  if (!verifyIdempotency(stream, event.idempotencyKey)) return { store, accepted: false, reason: "idempotency_collision_detected" };
  if (!verifyCausalOrder(stream, event.causalOrder)) return { store, accepted: false, reason: "causal_order_violation" };
  const nextStream: EventStream = { ...stream, events: [...stream.events, event] };
  const nextStreams = store.streams.map((candidate) =>
    candidate.tenantId === nextStream.tenantId && candidate.streamId === nextStream.streamId ? nextStream : candidate
  );
  return { store: { streams: nextStreams, ledger: appendLedgerEntry(store.ledger, event) }, accepted: true, reason: "event_appended" };
};

export const verifyLedgerHashChain = (ledger: AuditLedger): boolean =>
  ledger.entries.every((entry, index) => {
    const prev = index === 0 ? undefined : ledger.entries[index - 1];
    const prevHash = prev ? prev.hash : "GENESIS";
    const expected = hash(`${entry.index}:${entry.eventId}:${entry.tenantId}:${entry.streamId}:${prevHash}:${entry.timestamp}`);
    return entry.prevHash === prevHash && entry.hash === expected;
  });

export const replayDeterministic = <TState extends Record<string, string>>(
  stream: EventStream,
  projection: EventProjection<TState>,
  initialState: TState
): { ok: boolean; state: TState } => {
  let state = initialState;
  let expected = 1;
  for (const event of stream.events) {
    if (event.causalOrder !== expected) return { ok: false, state };
    state = projection.apply(state, event);
    expected += 1;
  }
  return { ok: true, state };
};

export const persistSnapshot = <TState extends Record<string, string>>(stream: EventStream, state: TState): SnapshotStore<TState> => ({
  tenantId: stream.tenantId,
  streamId: stream.streamId,
  state,
  lastEventId: stream.events[stream.events.length - 1]?.id ?? ""
});

export const loadSnapshot = <TState extends Record<string, string>>(snapshot: SnapshotStore<TState>): TState => snapshot.state;

export const applyRetentionCursor = (stream: EventStream, cursor: RetentionCursor, legalHoldActive: boolean): EventStream => {
  if (legalHoldActive) return stream;
  if (stream.tenantId !== cursor.tenantId || stream.streamId !== cursor.streamId) return stream;
  return { ...stream, events: stream.events.slice(cursor.retainFromOffset) };
};
