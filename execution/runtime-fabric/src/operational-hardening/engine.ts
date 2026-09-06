import type { EventCompactionStrategy, FailureContainmentBoundary, GraphPartition, MemoryBudget, OperationalHealthWatchdog, PerformanceBudget, ReplayWindowPolicy, TraceRetentionPolicy } from "./types.js";

export const enforceTraceRetention = <T extends { timestamp: string }>(traces: T[], policy: TraceRetentionPolicy): { hot: T[]; archived: T[] } => {
  const now = Date.now();
  const [hot, archived] = traces.reduce<[T[], T[]]>((acc, trace) => {
    const age = now - new Date(trace.timestamp).getTime();
    if (age > policy.archiveAfterMs) acc[1].push(trace);
    else acc[0].push(trace);
    return acc;
  }, [[], []]);
  return { hot: hot.slice(-policy.maxHotTraces), archived };
};

export const enforceReplayWindow = <T>(frames: T[], policy: ReplayWindowPolicy): T[] => frames.slice(-policy.maxFrames);

export const partitionGraph = (nodeIds: string[], partitionSize: number): GraphPartition[] => {
  const out: GraphPartition[] = [];
  for (let i = 0; i < nodeIds.length; i += partitionSize) out.push({ id: `part-${i / partitionSize}`, nodeIds: nodeIds.slice(i, i + partitionSize), edgeCount: Math.max(0, nodeIds.slice(i, i + partitionSize).length - 1) });
  return out;
};

export const compactEvents = <T extends { type: string; timestamp: string }>(events: T[], strategy: EventCompactionStrategy): T[] => {
  if (!strategy.keepLatestByType) return events;
  const map = new Map<string, T>();
  events.forEach((e) => map.set(e.type, e));
  return [...map.values()];
};

export const enforceMemoryBudget = (counts: { traceItems: number; replayFrames: number; graphNodes: number }, budget: MemoryBudget): string[] => {
  const issues: string[] = [];
  if (counts.traceItems > budget.maxTraceItems) issues.push("trace budget exceeded");
  if (counts.replayFrames > budget.maxReplayFrames) issues.push("replay budget exceeded");
  if (counts.graphNodes > budget.maxGraphNodes) issues.push("graph budget exceeded");
  return issues;
};

export const evaluateWatchdog = (metrics: { renderMs: number; eventsPerSec: number }, perf: PerformanceBudget, memoryIssues: string[]): OperationalHealthWatchdog => {
  const highPressure = metrics.renderMs > perf.maxRenderMs || metrics.eventsPerSec > perf.maxEventsPerSecond || memoryIssues.length >= perf.highPressureThreshold;
  return { highPressureMode: highPressure, alerts: highPressure ? ["high pressure mode active", ...memoryIssues] : [], governanceProtected: true };
};

export const containFailure = (failedPartitionId: string): FailureContainmentBoundary => ({ isolatePartitionIds: [failedPartitionId], blockPropagation: true });
