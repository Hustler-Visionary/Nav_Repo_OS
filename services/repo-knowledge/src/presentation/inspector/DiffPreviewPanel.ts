import type { ChangePreview } from "../../repo/provider.js";

export const renderDiffPreviewPanel = (preview: ChangePreview): string => {
  const conceptual = preview.beforeAfterConceptual.join("\n");
  const files = preview.affectedFiles.join(", ");
  const traces = preview.expectedTraces.join(", ");
  return `DiffPreviewPanel\ncommand:${preview.commandId}\naffected:${files}\n${conceptual}\nrisk:${preview.risk} cost:${preview.cost} confidence:${preview.confidence}\nexpectedTraces:${traces}\nrollback:${preview.rollbackPlan}`;
};
