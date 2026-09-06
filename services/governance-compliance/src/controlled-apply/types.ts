export type ApplyState = "APPLY_PENDING" | "APPLY_VALIDATING" | "APPLY_LOCKED" | "APPLY_EXECUTING" | "APPLY_VERIFYING" | "APPLY_COMPLETED" | "APPLY_FAILED" | "APPLY_ROLLBACK_REQUIRED" | "APPLY_ROLLING_BACK" | "APPLY_ROLLED_BACK" | "APPLY_ABORTED";

export type ApplyBoundary = { allowedPaths: string[]; protectedRoots: string[]; maxBatchSize: number };
export type ApplyLock = { path: string; active: boolean; reason: string };
export type ApplyConflict = { path: string; type: "hash_mismatch" | "concurrent_mutation" | "unknown"; safe: boolean; details: string };
export type ApplyCheckpoint = { id: string; path: string; before: string; hash: string };
export type ApplyRollback = { checkpointIds: string[]; ready: boolean; notes: string };
export type ApplyVerification = { integrity: boolean; dependencies: boolean; replay: boolean; rollbackReady: boolean; reasons: string[] };
export type ApplyReceipt = { id: string; action: string; success: boolean; details: string };
export type ApplyExecution = { id: string; proposalId: string; state: ApplyState; receipts: ApplyReceipt[]; verification: ApplyVerification; rollback: ApplyRollback; conflicts: ApplyConflict[] };
export type ApplyBatch = { id: string; proposalIds: string[]; transactional: boolean; orderedPaths: string[] };
export type ControlledApplySession = { id: string; state: ApplyState; boundary: ApplyBoundary; locks: ApplyLock[]; checkpoints: ApplyCheckpoint[]; executions: ApplyExecution[]; governanceApprovedProposalIds: string[]; paused: boolean; emergencyStop: boolean };
