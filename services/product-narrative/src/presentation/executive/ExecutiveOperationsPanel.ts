import type { ProductWorkflow } from "../../product-workflows/types.js";

export const renderExecutiveOperationsPanel = (workflows: ProductWorkflow[]): string => {
  const active = workflows.filter((w) => w.governanceState === "IN_PROGRESS").length;
  const blocked = workflows.filter((w) => w.governanceState === "BLOCKED" || w.governanceState === "ESCALATED").length;
  const avgConfidence = workflows.length === 0 ? 0 : workflows.reduce((a, w) => a + w.confidenceProfile, 0) / workflows.length;
  return `ExecutiveOperationsPanel\nactive:${active}\nblocked:${blocked}\ndeliveryConfidence:${avgConfidence.toFixed(2)}\nworkflows:${workflows.length}`;
};
