export type EventEnvelope<TPayload = Record<string, string>> = {
  id: string;
  tenantId: string;
  streamId: string;
  type: string;
  payload: TPayload;
  idempotencyKey: string;
  causalOrder: number;
  timestamp: string;
};

export type EventStream = {
  tenantId: string;
  streamId: string;
  events: EventEnvelope[];
};

export type EventCursor = {
  tenantId: string;
  streamId: string;
  offset: number;
};

export type EventProjection<TState = Record<string, string>> = {
  name: string;
  version: number;
  apply: (state: TState, event: EventEnvelope) => TState;
};

export type LedgerEntry = {
  index: number;
  eventId: string;
  tenantId: string;
  streamId: string;
  prevHash: string;
  hash: string;
  timestamp: string;
};

export type LedgerHashChain = {
  entries: readonly LedgerEntry[];
};

export type AuditLedger = {
  entries: readonly LedgerEntry[];
};

export type IdempotencyKey = string;

export type CausalOrdering = {
  lastOrder: number;
};

export type StateProjection<TState = Record<string, string>> = {
  tenantId: string;
  streamId: string;
  state: TState;
  lastEventId?: string;
};

export type SnapshotStore<TState = Record<string, string>> = {
  tenantId: string;
  streamId: string;
  state: TState;
  lastEventId: string;
};

export type TenantScopedStream = EventStream;

export type RetentionCursor = {
  tenantId: string;
  streamId: string;
  retainFromOffset: number;
};

export type EventStore = {
  streams: readonly EventStream[];
  ledger: AuditLedger;
};
