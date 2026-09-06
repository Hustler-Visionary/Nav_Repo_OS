export type WorkflowState = "PLANNED" | "SCOPED" | "APPROVED" | "IN_PROGRESS" | "VERIFYING" | "BLOCKED" | "ESCALATED" | "RECOVERING" | "COMPLETED" | "FAILED";
export type WorkflowPhaseName = "Interpretation + Planning" | "Architecture + Dependency Mapping" | "Implementation" | "Verification + QA" | "Governance Review" | "Evolution Proposal Generation" | "Completion + Snapshot";

export type WorkflowObjective = { businessGoal: string; technicalObjective: string; constraints: string[] };
export type WorkflowExecutionPlan = { phases: WorkflowPhaseName[]; checkpoints: string[]; dependencies: string[] };
export type WorkflowDependencyMap = { from: string; to: string; approved: boolean }[];
export type WorkflowMilestone = { id: string; name: string; state: "pending" | "done" };
export type WorkflowCheckpoint = { id: string; phase: WorkflowPhaseName; approved: boolean; notes: string };
export type WorkflowPhase = { id: string; name: WorkflowPhaseName; state: WorkflowState; metrics: Record<string, number>; governanceState: string; verificationArtifacts: string[]; traceRefs: string[] };

export type ProductWorkflow = {
  id: string;
  objective: WorkflowObjective;
  approvals: string[];
  executionPlan: WorkflowExecutionPlan;
  dependencyMap: WorkflowDependencyMap;
  milestones: WorkflowMilestone[];
  checkpoints: WorkflowCheckpoint[];
  phases: WorkflowPhase[];
  assignedSubteams: string[];
  assignedAgents: string[];
  riskProfile: "low" | "medium" | "high";
  confidenceProfile: number;
  governanceState: WorkflowState;
  rollbackReadiness: boolean;
  evolutionCandidates: string[];
  traceRefs: string[];
};
