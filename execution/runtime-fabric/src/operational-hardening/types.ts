export type PerformanceBudget = { maxRenderMs: number; maxEventsPerSecond: number; highPressureThreshold: number };
export type MemoryBudget = { maxTraceItems: number; maxReplayFrames: number; maxGraphNodes: number };
export type TraceRetentionPolicy = { maxHotTraces: number; archiveAfterMs: number; compressArchived: boolean };
export type ReplayWindowPolicy = { maxFrames: number; maxWindowMs: number };
export type GraphPartition = { id: string; nodeIds: string[]; edgeCount: number };
export type EventCompactionStrategy = { keepLatestByType: boolean; dedupeWindowMs: number };
export type FailureContainmentBoundary = { isolatePartitionIds: string[]; blockPropagation: boolean };
export type OperationalHealthWatchdog = { highPressureMode: boolean; alerts: string[]; governanceProtected: boolean };
