export type RuntimeState = "IDLE" | "WAITING" | "THINKING" | "PLANNING" | "EXECUTING" | "VERIFYING" | "HANDOFF" | "BLOCKED" | "ESCALATED" | "COMPLETED" | "FAILED";

export type RuntimeTask = {
  id: string;
  label: string;
  dependencies: string[];
  priority: number;
  approvalRequired: boolean;
  verificationRequired: boolean;
  retries: number;
  state: RuntimeState;
};

export type RuntimeDecisionFrame = {
  id: string;
  rationale: string;
  confidenceReasoning: string;
  ambiguityDetected: boolean;
  constraints: string[];
  justification: string;
};

export type RuntimeAgent = {
  id: string;
  role: string;
  subteam: string;
  activeTask: string | undefined;
  queue: string[];
  confidence: number;
  workload: number;
  executionHistory: string[];
  retryCount: number;
  verificationPartner: string;
  escalationState: "none" | "pending" | "active";
  governanceFlags: string[];
};

export type RuntimeExecutionQueue = { pending: RuntimeTask[]; blocked: RuntimeTask[]; active: RuntimeTask[]; completed: RuntimeTask[] };
export type RuntimeExecutionCycle = { id: string; startedAt: string; endedAt?: string; agentIds: string[]; traceRefs: string[] };

export type RuntimeExecutionSession = {
  id: string;
  goal: string;
  state: RuntimeState;
  agents: RuntimeAgent[];
  queue: RuntimeExecutionQueue;
  cycles: RuntimeExecutionCycle[];
  decisionFrames: RuntimeDecisionFrame[];
  concurrencyLimit: number;
  replayCursor: number;
  governancePaused: boolean;
  emergencyStop: boolean;
  resourceBudget: number;
  tokenBudget: number;
};
