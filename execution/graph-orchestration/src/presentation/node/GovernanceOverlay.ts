import type { ExecutionNode } from "../../graph-orchestration/types.js";

export const renderGovernanceOverlay = (node: ExecutionNode): string[] => {
  const overlays: string[] = [];
  if (node.state === "BLOCKED") overlays.push("semantic firewall blocked");
  if (node.approvalRequired && node.state === "WAITING_APPROVAL") overlays.push("approval required");
  if (node.state === "FAILED") overlays.push("validation failed");
  if (node.verificationRequired && node.state === "VERIFYING") overlays.push("verification pending");
  if (node.state === "ESCALATED") overlays.push("escalation active");
  if (node.state === "COMPLETED") overlays.push("rollback ready");
  return overlays;
};
