export type WorkerCapability = "typescript" | "python" | "verification" | "governance" | "replay";

export type ExecutionWorker = {
  id: string;
  clusterId: string;
  region: string;
  capabilities: WorkerCapability[];
  sandboxId: string;
  heartbeatAt: string;
  quarantined: boolean;
};

export type DistributedQueue = {
  id: string;
  partitions: QueuePartition[];
};

export type QueuePartition = {
  id: string;
  region: string;
  isolated: boolean;
  taskIds: string[];
};

export type QueueLease = {
  id: string;
  workerId: string;
  taskId: string;
  expiresAt: string;
};

export type ExecutionLease = QueueLease;

export type RegionExecutionPolicy = {
  sourceRegion: string;
  targetRegion: string;
  allowed: boolean;
};

export type RuntimeSandbox = {
  id: string;
  workerId: string;
  runtime: "node" | "python";
  isolated: true;
};

export type InfrastructureNode = {
  id: string;
  region: string;
  status: "healthy" | "degraded" | "failed";
};

export type InfrastructureHealth = {
  clusterId: string;
  healthyNodes: number;
  degradedNodes: number;
  failedNodes: number;
};

export type DistributedTraceCorrelation = {
  chainId: string;
  traceIds: string[];
  causalOrder: string[];
};

export type FabricRecoveryPlan = {
  id: string;
  clusterId: string;
  boundedSteps: string[];
};

export type FabricCheckpoint = {
  id: string;
  clusterId: string;
  createdAt: string;
  rollbackRef: string;
};

export type InfrastructureRollback = {
  checkpointId: string;
  verified: boolean;
};

export type WorkerHeartbeat = {
  workerId: string;
  timestamp: string;
};

export type ClusterCoordinationState = "initializing" | "ready" | "degraded" | "recovering";

export type ExecutionCluster = {
  id: string;
  region: string;
  workers: ExecutionWorker[];
  queue: DistributedQueue;
  coordination: ClusterCoordinationState;
};

export type ExecutionFabric = {
  id: string;
  clusters: ExecutionCluster[];
};
