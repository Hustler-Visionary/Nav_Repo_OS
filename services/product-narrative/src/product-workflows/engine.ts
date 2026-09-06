import type { ProductWorkflow, WorkflowPhase, WorkflowPhaseName } from "./types.js";

const phaseOrder: WorkflowPhaseName[] = ["Interpretation + Planning", "Architecture + Dependency Mapping", "Implementation", "Verification + QA", "Governance Review", "Evolution Proposal Generation", "Completion + Snapshot"];

export const createWorkflow = (id: string, businessGoal: string, technicalObjective: string): ProductWorkflow => ({
  id,
  objective: { businessGoal, technicalObjective, constraints: [] },
  approvals: [],
  executionPlan: { phases: [...phaseOrder], checkpoints: [], dependencies: [] },
  dependencyMap: [],
  milestones: phaseOrder.map((p, i) => ({ id: `m${i+1}`, name: p, state: "pending" })),
  checkpoints: [],
  phases: phaseOrder.map((name, index) => ({ id: `p${index+1}`, name, state: index === 0 ? "SCOPED" : "PLANNED", metrics: {}, governanceState: "pending", verificationArtifacts: [], traceRefs: [] })),
  assignedSubteams: [],
  assignedAgents: [],
  riskProfile: "medium",
  confidenceProfile: 0.75,
  governanceState: "SCOPED",
  rollbackReadiness: false,
  evolutionCandidates: [],
  traceRefs: []
});

export const advancePhase = (workflow: ProductWorkflow, phaseId: string): ProductWorkflow => ({
  ...workflow,
  phases: workflow.phases.map((phase) => phase.id === phaseId ? { ...phase, state: "COMPLETED", governanceState: "passed" } : phase),
  governanceState: "IN_PROGRESS"
});

export const blockWorkflow = (workflow: ProductWorkflow, reason: string): ProductWorkflow => ({ ...workflow, governanceState: "BLOCKED", traceRefs: [...workflow.traceRefs, `workflow_blocked:${reason}`] });
export const recoverWorkflow = (workflow: ProductWorkflow, recoveryRef: string): ProductWorkflow => ({ ...workflow, governanceState: "RECOVERING", traceRefs: [...workflow.traceRefs, recoveryRef] });
export const completeWorkflow = (workflow: ProductWorkflow): ProductWorkflow => ({ ...workflow, governanceState: "COMPLETED", rollbackReadiness: true });

export const workflowHealth = (workflow: ProductWorkflow): number => {
  const completed = workflow.phases.filter((p) => p.state === "COMPLETED").length;
  return completed / workflow.phases.length;
};

export const getCurrentPhase = (workflow: ProductWorkflow): WorkflowPhase | undefined => workflow.phases.find((p) => p.state !== "COMPLETED");
