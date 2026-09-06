import type { ProductWorkflow } from "../product-workflows/types.js";

export type DeliverableType = "architecture_brief" | "implementation_report" | "governance_report" | "execution_summary" | "trace_summary" | "risk_report" | "verification_report" | "evolution_proposal" | "rollback_plan" | "approval_package";
export type Deliverable = { id: string; workflowId: string; type: DeliverableType; version: number; content: string; traceRef: string };

export const generateDeliverable = (workflow: ProductWorkflow, type: DeliverableType, version: number): Deliverable => ({
  id: `${workflow.id}-${type}-v${version}`,
  workflowId: workflow.id,
  type,
  version,
  content: `[${type}] workflow=${workflow.id} state=${workflow.governanceState}`,
  traceRef: `deliverable_generated:${type}`
});
