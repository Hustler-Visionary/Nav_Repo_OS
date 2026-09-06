import type { TraceEvent, TraceEventBus } from "./types.js";

export const createTraceEventBus = (): TraceEventBus => {
  const events: TraceEvent[] = [];
  const handlers = new Set<(event: TraceEvent) => void>();

  return {
    publish: (event) => {
      events.push(event);
      handlers.forEach((handler) => handler(event));
    },
    subscribe: (handler) => {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    getSnapshot: () => [...events]
  };
};
