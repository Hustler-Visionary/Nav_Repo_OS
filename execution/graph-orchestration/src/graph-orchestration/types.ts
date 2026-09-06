export type ExecutionState = "DRAFT" | "QUEUED" | "ROUTING" | "WAITING_APPROVAL" | "APPROVED" | "EXECUTING" | "VERIFYING" | "BLOCKED" | "FAILED" | "ESCALATED" | "COMPLETED";

export type ExecutionNode = {
  id: string;
  type: "repo" | "agent-task" | "verification" | "approval" | "governance";
  ownerAgent: string;
  subteam: string;
  state: ExecutionState;
  risk: "low" | "medium" | "high";
  confidence: number;
  cost: "low" | "medium" | "high";
  retries: number;
  dependencies: string[];
  blockers: string[];
  traceRefs: string[];
  approvalRequired: boolean;
  verificationRequired: boolean;
};

export type ExecutionEdge = { from: string; to: string; animated: boolean; pulse: boolean };
export type ExecutionRoute = { id: string; nodeIds: string[]; score: number; rejected: boolean; rejectionReason?: string };
export type AgentTask = { id: string; agentId: string; subteam: string; nodeId: string; retries: number; busy: boolean };
export type VerificationTask = { id: string; nodeId: string; owner: string; state: "pending" | "running" | "passed" | "failed" };
export type ApprovalCheckpoint = { id: string; nodeId: string; status: "pending" | "approved" | "rejected" };
export type ExecutionGraph = { id: string; nodes: ExecutionNode[]; edges: ExecutionEdge[]; routes: ExecutionRoute[]; sessionId: string };
