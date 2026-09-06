import type { ExecutionGraph, ExecutionNode, ExecutionState } from "./types.js";

const allowed: Record<ExecutionState, ExecutionState[]> = {
  DRAFT: ["QUEUED", "BLOCKED"],
  QUEUED: ["ROUTING", "WAITING_APPROVAL", "EXECUTING", "BLOCKED"],
  ROUTING: ["WAITING_APPROVAL", "EXECUTING", "BLOCKED"],
  WAITING_APPROVAL: ["APPROVED", "BLOCKED", "ESCALATED"],
  APPROVED: ["EXECUTING", "BLOCKED"],
  EXECUTING: ["VERIFYING", "FAILED", "ESCALATED", "COMPLETED"],
  VERIFYING: ["COMPLETED", "FAILED", "ESCALATED"],
  BLOCKED: ["ESCALATED", "QUEUED"],
  FAILED: ["QUEUED", "ESCALATED"],
  ESCALATED: ["WAITING_APPROVAL", "BLOCKED"],
  COMPLETED: []
};

export const createExecutionGraph = (id: string, nodes: ExecutionNode[]): ExecutionGraph => ({ id, nodes: [...nodes], edges: [], routes: [], sessionId: `sess-${id}` });
export const canTransitionExecution = (from: ExecutionState, to: ExecutionState): boolean => allowed[from].includes(to);
export const transitionNodeState = (graph: ExecutionGraph, nodeId: string, next: ExecutionState): ExecutionGraph => ({
  ...graph,
  nodes: graph.nodes.map((n) => (n.id === nodeId && canTransitionExecution(n.state, next) ? { ...n, state: next } : n))
});
export const countExecutionByState = (graph: ExecutionGraph, state: ExecutionState): number => graph.nodes.filter((n) => n.state === state).length;
