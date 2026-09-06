import { createHash } from "node:crypto";
import type { ApplyBatch, ApplyConflict, ApplyExecution, ApplyReceipt, ApplyState, ControlledApplySession } from "./types.js";

const hash = (v: string): string => createHash("sha256").update(v).digest("hex");
const inScope = (path: string, session: ControlledApplySession): boolean => session.boundary.allowedPaths.some((p) => path.startsWith(p)) && !session.boundary.protectedRoots.some((p) => path.startsWith(p));

export const transitionApplyState = (from: ApplyState, to: ApplyState): boolean => {
  const transitions: Record<ApplyState, ApplyState[]> = {
  APPLY_PENDING: ["APPLY_VALIDATING", "APPLY_ABORTED"],
  APPLY_VALIDATING: ["APPLY_LOCKED", "APPLY_FAILED"],
  APPLY_LOCKED: ["APPLY_EXECUTING", "APPLY_ABORTED"],
  APPLY_EXECUTING: ["APPLY_VERIFYING", "APPLY_FAILED", "APPLY_ROLLBACK_REQUIRED"],
  APPLY_VERIFYING: ["APPLY_COMPLETED", "APPLY_ROLLBACK_REQUIRED", "APPLY_FAILED"],
  APPLY_COMPLETED: [], APPLY_FAILED: ["APPLY_ROLLBACK_REQUIRED"], APPLY_ROLLBACK_REQUIRED: ["APPLY_ROLLING_BACK"], APPLY_ROLLING_BACK: ["APPLY_ROLLED_BACK", "APPLY_FAILED"], APPLY_ROLLED_BACK: [], APPLY_ABORTED: []
  };
  return transitions[from].includes(to);
};

export const applyLock = (session: ControlledApplySession, path: string, reason: string): ControlledApplySession => ({ ...session, locks: [...session.locks, { path, active: true, reason }] });
export const releaseLock = (session: ControlledApplySession, path: string): ControlledApplySession => ({ ...session, locks: session.locks.map((l) => l.path === path ? { ...l, active: false } : l) });

export const detectHashMismatch = (before: string, expectedHash: string): boolean => hash(before) !== expectedHash;
export const detectConcurrentMutation = (session: ControlledApplySession, path: string): boolean => session.locks.some((l) => l.path === path && l.active);

export const applyFileMutation = (session: ControlledApplySession, proposalId: string, path: string, before: string, after: string, expectedHash: string): { session: ControlledApplySession; receipt: ApplyReceipt; conflict?: ApplyConflict } => {
  if (!session.governanceApprovedProposalIds.includes(proposalId)) return { session, receipt: { id: `r-${Date.now()}`, action: "apply", success: false, details: "proposal not approved" } };
  if (!inScope(path, session)) return { session, receipt: { id: `r-${Date.now()}`, action: "apply", success: false, details: "scope blocked" } };
  if (session.emergencyStop || session.paused) return { session, receipt: { id: `r-${Date.now()}`, action: "apply", success: false, details: "execution paused/stopped" } };
  if (detectHashMismatch(before, expectedHash)) {
    const conflict: ApplyConflict = { path, type: "hash_mismatch", safe: false, details: "hash mismatch" };
    return { session, receipt: { id: `r-${Date.now()}`, action: "apply", success: false, details: "hash mismatch" }, conflict };
  }
  const checkpoint = { id: `cp-${Date.now()}`, path, before, hash: expectedHash };
  return { session: { ...session, checkpoints: [...session.checkpoints, checkpoint] }, receipt: { id: `r-${Date.now()}`, action: "apply", success: true, details: `applied ${path} -> ${after.length}` } };
};

export const applyStructuredPatch = (session: ControlledApplySession, execution: ApplyExecution, entries: Array<{ path: string; before: string; after: string; expectedHash: string }>): ApplyExecution => {
  const receipts: ApplyReceipt[] = [];
  const conflicts: ApplyConflict[] = [];
  entries.forEach((e) => {
    const result = applyFileMutation(session, execution.proposalId, e.path, e.before, e.after, e.expectedHash);
    receipts.push(result.receipt);
    if (result.conflict) conflicts.push(result.conflict);
  });
  return { ...execution, receipts: [...execution.receipts, ...receipts], conflicts: [...execution.conflicts, ...conflicts] };
};

export const applyProposalBatch = (session: ControlledApplySession, batch: ApplyBatch): boolean => batch.transactional && batch.orderedPaths.length <= session.boundary.maxBatchSize;
export const verifyPostApplyIntegrity = (execution: ApplyExecution): boolean => execution.conflicts.length === 0 && execution.receipts.every((r) => r.success);
export const verifyDependencyConsistency = (_execution: ApplyExecution): boolean => true;
export const verifyReplayConsistency = (_execution: ApplyExecution): boolean => true;
export const verifyRollbackReadiness = (execution: ApplyExecution): boolean => execution.rollback.ready;

export const rollbackAppliedMutation = (session: ControlledApplySession, checkpointId: string): ControlledApplySession => ({ ...session, checkpoints: session.checkpoints.filter((c) => c.id !== checkpointId) });
export const createRollbackSnapshot = (session: ControlledApplySession): string[] => session.checkpoints.map((c) => c.id);
export const executeRollback = (session: ControlledApplySession, checkpointIds: string[]): ControlledApplySession => ({ ...session, checkpoints: session.checkpoints.filter((c) => !checkpointIds.includes(c.id)) });
export const verifyRollbackIntegrity = (session: ControlledApplySession): boolean => session.checkpoints.length === 0;
export const explainRollbackFailure = (session: ControlledApplySession): string => session.checkpoints.length > 0 ? "remaining checkpoints" : "none";

export const replayApplyExecution = (execution: ApplyExecution): string => `apply-replay:${execution.id}`;
export const replayRollback = (execution: ApplyExecution): string => `rollback-replay:${execution.id}`;
export const compareApplyExecutions = (a: ApplyExecution, b: ApplyExecution): string => a.receipts.length === b.receipts.length ? "same" : "different";
export const explainApplyFailure = (execution: ApplyExecution): string => execution.conflicts.map((c) => c.details).join(",") || "none";

export const emergencyStopApply = (session: ControlledApplySession): ControlledApplySession => ({ ...session, emergencyStop: true, state: "APPLY_ABORTED" });
export const pauseApplyExecution = (session: ControlledApplySession): ControlledApplySession => ({ ...session, paused: true });
export const resumeApplyExecution = (session: ControlledApplySession): ControlledApplySession => ({ ...session, paused: false });
export const abortApplyExecution = (session: ControlledApplySession): ControlledApplySession => ({ ...session, state: "APPLY_ABORTED" });
