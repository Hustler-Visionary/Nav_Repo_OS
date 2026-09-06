import type {
  DistributedTraceCorrelation,
  ExecutionCluster,
  ExecutionWorker,
  FabricRecoveryPlan,
  InfrastructureHealth,
  InfrastructureNode,
  InfrastructureRollback,
  QueueLease,
  QueuePartition,
  RegionExecutionPolicy,
  RuntimeSandbox,
  WorkerCapability,
  WorkerHeartbeat
} from "./types.js";

const toMillis = (iso: string): number => new Date(iso).getTime();

export const checkWorkerHeartbeatTimeout = (
  worker: ExecutionWorker,
  nowIso: string,
  timeoutMs: number
): ExecutionWorker => ({
  ...worker,
  quarantined: toMillis(nowIso) - toMillis(worker.heartbeatAt) > timeoutMs
});

export const assignTaskDeterministically = (
  workers: ExecutionWorker[],
  capability: WorkerCapability,
  taskId: string
): ExecutionWorker | undefined => {
  const eligible = workers.filter((worker) => worker.capabilities.includes(capability) && !worker.quarantined);
  if (eligible.length === 0) return undefined;
  const sorted = [...eligible].sort((a, b) => a.id.localeCompare(b.id));
  const index = taskId.length % sorted.length;
  return sorted[index];
};

export const expireLeaseAndRequeue = (
  lease: QueueLease,
  nowIso: string,
  partition: QueuePartition
): { expired: boolean; partition: QueuePartition } => {
  const expired = toMillis(nowIso) > toMillis(lease.expiresAt);
  if (!expired) return { expired: false, partition };
  return {
    expired: true,
    partition: partition.taskIds.includes(lease.taskId)
      ? partition
      : { ...partition, taskIds: [...partition.taskIds, lease.taskId] }
  };
};

export const isolateQueuePartition = (partition: QueuePartition): QueuePartition => ({ ...partition, isolated: true });

export const verifyRegionExecution = (policies: RegionExecutionPolicy[], sourceRegion: string, targetRegion: string): boolean =>
  policies.some((policy) => policy.sourceRegion === sourceRegion && policy.targetRegion === targetRegion && policy.allowed);

export const createRuntimeSandbox = (workerId: string, runtime: RuntimeSandbox["runtime"]): RuntimeSandbox => ({
  id: `sandbox-${workerId}-${runtime}`,
  workerId,
  runtime,
  isolated: true
});

export const computeInfrastructureHealth = (clusterId: string, nodes: InfrastructureNode[]): InfrastructureHealth => ({
  clusterId,
  healthyNodes: nodes.filter((node) => node.status === "healthy").length,
  degradedNodes: nodes.filter((node) => node.status === "degraded").length,
  failedNodes: nodes.filter((node) => node.status === "failed").length
});

export const boundedFailover = (cluster: ExecutionCluster, maxMoves: number): { cluster: ExecutionCluster; movedWorkers: number } => {
  const movedWorkers = Math.min(maxMoves, cluster.workers.filter((worker) => worker.quarantined).length);
  return {
    cluster: { ...cluster, coordination: movedWorkers > 0 ? "recovering" : cluster.coordination },
    movedWorkers
  };
};

export const correlateDistributedTrace = (chainId: string, traceIds: string[]): DistributedTraceCorrelation => ({
  chainId,
  traceIds,
  causalOrder: [...traceIds]
});

export const deterministicDistributedReplay = (events: string[]): string[] => [...events].sort();

export const verifyInfrastructureRollback = (rollback: InfrastructureRollback): boolean => rollback.verified;

export const applyHeartbeat = (worker: ExecutionWorker, heartbeat: WorkerHeartbeat): ExecutionWorker =>
  worker.id !== heartbeat.workerId ? worker : { ...worker, heartbeatAt: heartbeat.timestamp, quarantined: false };

export const recoverFabricBounded = (plan: FabricRecoveryPlan): boolean => plan.boundedSteps.length > 0 && plan.boundedSteps.length <= 10;

export const governanceSpineSurvivesWorkerFailure = (workers: ExecutionWorker[]): boolean =>
  workers.some((worker) => !worker.quarantined && worker.capabilities.includes("governance"));
