import type { ProductWorkflow } from "./types.js";

export type RecoveryPlan = { id: string; workflowId: string; diagnosis: string; reroute: string; rollbackSimulation: string; governanceReviewRequired: boolean; degradedPathPrevented: boolean };

export const createRecoveryPlan = (workflow: ProductWorkflow, diagnosis: string): RecoveryPlan => ({
  id: `recovery-${workflow.id}`,
  workflowId: workflow.id,
  diagnosis,
  reroute: "Switch to safest approved route",
  rollbackSimulation: "simulate rollback to last checkpoint",
  governanceReviewRequired: true,
  degradedPathPrevented: true
});

export const applyRecoveryPlan = (workflow: ProductWorkflow, plan: RecoveryPlan): ProductWorkflow => ({
  ...workflow,
  governanceState: "RECOVERING",
  evolutionCandidates: [...workflow.evolutionCandidates, `candidate:${plan.id}`],
  traceRefs: [...workflow.traceRefs, `recovery_started:${plan.id}`, `recovery_completed:${plan.id}`]
});
