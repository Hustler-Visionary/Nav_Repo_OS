import type { TraceEvent } from "../trace/types.js";

export type TraceCategory = "governance" | "execution" | "validation" | "firewall" | "evolution" | "loop-prevention" | "ui-validation" | "repo";
export type TraceSeverity = "INFO" | "WARN" | "ERROR" | "CRITICAL";

export type StreamTrace = TraceEvent & {
  category: TraceCategory;
  severity: TraceSeverity;
  correlationId: string;
  executionSessionId: string;
};

export type TraceFilter = { category?: TraceCategory; severity?: TraceSeverity; correlationId?: string };

export const createTraceStream = (maxBuffer = 200) => {
  let buffer: StreamTrace[] = [];
  return {
    connect: (): StreamTrace[] => [...buffer],
    push: (trace: StreamTrace) => {
      buffer = [...buffer, trace].slice(-maxBuffer);
    },
    filter: (filter: TraceFilter): StreamTrace[] =>
      buffer.filter((trace) => {
        if (filter.category && trace.category !== filter.category) return false;
        if (filter.severity && trace.severity !== filter.severity) return false;
        if (filter.correlationId && trace.correlationId !== filter.correlationId) return false;
        return true;
      }),
    throughputPerSecond: () => buffer.length,
    virtualizedWindow: (offset: number, limit: number): StreamTrace[] => buffer.slice(offset, offset + limit)
  };
};
