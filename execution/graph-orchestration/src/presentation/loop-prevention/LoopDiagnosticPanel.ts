import type { ExecutionNode } from "../../graph-orchestration/types.js";

export const detectLoopSignature = (nodes: ExecutionNode[]): { loopDetected: boolean; signatures: string[] } => {
  const signatures = nodes.filter((n) => n.retries >= 3 || n.state === "FAILED").map((n) => `${n.id}:${n.retries}:${n.state}`);
  return { loopDetected: signatures.length > 0, signatures };
};

export const renderLoopDiagnosticPanel = (nodes: ExecutionNode[]): string => {
  const loop = detectLoopSignature(nodes);
  return loop.loopDetected ? `LOOP ALERT\n${loop.signatures.join("\n")}` : "LOOP OK";
};
