import type { RealityBridge, RealityExecutionDiff, RealityExecutionReceipt, RealityExecutionSession, RealityRollbackPlan, RealitySnapshot } from "./types.js";

export const createRealitySession = (session: RealityExecutionSession): RealityBridge => ({ session, snapshots: [] });

const withinScope = (path: string, allowed: string[], protectedRoots: string[]): boolean =>
  allowed.some((prefix) => path.startsWith(prefix)) && !protectedRoots.some((root) => path.startsWith(root));

export const requestFilesystemWrite = (bridge: RealityBridge, path: string, before: string, after: string): { bridge: RealityBridge; diff: RealityExecutionDiff; receipt: RealityExecutionReceipt } => {
  const diff: RealityExecutionDiff = { target: path, before, after, summary: `change ${path}` };
  if (bridge.session.emergencyStop || bridge.session.governanceLock) {
    const receipt: RealityExecutionReceipt = { id: `r-${Date.now()}`, action: "filesystem_write", success: false, blockedReason: "governance lock", replayMetadata: "filesystem_write_blocked", rollbackMetadata: "none" };
    return { bridge: { ...bridge, session: { ...bridge.session, receipts: [...bridge.session.receipts, receipt] } }, diff, receipt };
  }
  if (bridge.session.permit.humanApprovalState !== "approved") {
    const receipt: RealityExecutionReceipt = { id: `r-${Date.now()}`, action: "filesystem_write", success: false, blockedReason: "approval required", replayMetadata: "filesystem_write_blocked", rollbackMetadata: "none" };
    return { bridge: { ...bridge, session: { ...bridge.session, receipts: [...bridge.session.receipts, receipt] } }, diff, receipt };
  }
  if (!withinScope(path, bridge.session.scope.allowedPaths, bridge.session.scope.protectedRoots)) {
    const receipt: RealityExecutionReceipt = { id: `r-${Date.now()}`, action: "filesystem_write", success: false, blockedReason: "scope blocked", replayMetadata: "filesystem_write_blocked", rollbackMetadata: "none" };
    return { bridge: { ...bridge, session: { ...bridge.session, receipts: [...bridge.session.receipts, receipt] } }, diff, receipt };
  }
  const receipt: RealityExecutionReceipt = { id: `r-${Date.now()}`, action: "filesystem_write", success: true, replayMetadata: "filesystem_write_applied", rollbackMetadata: "rollback_snapshot_created" };
  return { bridge: { ...bridge, session: { ...bridge.session, receipts: [...bridge.session.receipts, receipt] } }, diff, receipt };
};

export const createRollbackSnapshot = (bridge: RealityBridge, files: Record<string, string>): RealityBridge => {
  const snapshot: RealitySnapshot = { id: `snap-${Date.now()}`, at: new Date().toISOString(), files: structuredClone(files) };
  return { ...bridge, snapshots: [...bridge.snapshots, snapshot] };
};

export const applyRollback = (bridge: RealityBridge, plan: RealityRollbackPlan): { bridge: RealityBridge; passed: boolean } => {
  const exists = bridge.snapshots.some((snapshot) => snapshot.id === plan.checkpointId);
  return { bridge, passed: exists && plan.confidence >= 0.5 };
};

export const commandAllowed = (bridge: RealityBridge, command: string): boolean => bridge.session.scope.allowedCommands.includes(command);
export const networkAllowed = (bridge: RealityBridge, domain: string): boolean => bridge.session.scope.allowedDomains.includes(domain);
export const mcpAllowed = (bridge: RealityBridge, cap: string): boolean => bridge.session.scope.allowedMcpCapabilities.includes(cap);

export const blastRadiusScore = (impacted: number, dependencyImpact: number): number => impacted * 0.6 + dependencyImpact * 0.4;
export const blastRadiusExceeded = (bridge: RealityBridge, score: number): boolean => score > bridge.session.scope.maxBlastRadius;

export const activateGovernanceLock = (bridge: RealityBridge): RealityBridge => ({ ...bridge, session: { ...bridge.session, governanceLock: true } });
export const emergencyStop = (bridge: RealityBridge): RealityBridge => ({ ...bridge, session: { ...bridge.session, emergencyStop: true } });
