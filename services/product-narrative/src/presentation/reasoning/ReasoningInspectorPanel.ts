import type { Narrative } from "../../storytelling/narrative.js";

export const renderReasoningInspectorPanel = (narratives: Narrative[]): string => {
  const lines = narratives.map((n) => `${n.kind}:${n.text}`).join("\n");
  return `ReasoningInspectorPanel\n${lines}`;
};
