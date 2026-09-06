import type { RepoNode } from "../../repo/types.js";

export type NodeEditorTab = "code" | "description";

export const renderTraceTimeline = (node: RepoNode): string => node.traceEvents
  .slice()
  .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  .map((event) => `- ${event.type} | ${event.timestamp} | ${event.actor} | result:logged | ${event.details}`)
  .join("\n");

export const renderNodeEditor = (node: RepoNode, tab: NodeEditorTab): string => {
  const header = `📄 ${node.path} | ${node.language ?? "plain"} | ${node.artifactType}`;
  const badges = `Risk:${node.risk} | Confidence:${node.confidence} | Cost:${node.cost}`;

  if (tab === "code") {
    const codeLines = node.codePreview.split("\n").map((line, index) => `${String(index + 1).padStart(3, " ")} ${line}`).join("\n");
    return `${header}\n${badges}\nTAB: CÓDIGO (Editor principal)\n${codeLines}`;
  }

  const changelog = node.changelog.map((entry) => `- ${entry.at} ${entry.author}: ${entry.summary}`).join("\n") || "- sin cambios";
  const traces = node.traceEvents.map((event) => `- ${event.type} @ ${event.timestamp}`).join("\n") || "- sin trazas";
  const validations = node.validations.map((validation) => `- ${validation.name}: ${validation.passed ? "ok" : "fail"}`).join("\n") || "- sin validaciones";
  const timeline = renderTraceTimeline(node) || "- timeline vacía";

  return `${header}\n${badges}\nTAB: Descripción y Registro\nDescripción del Nodo: ${node.description}\nResponsabilidades principales: ${node.responsibilities.join(", ")}\nDependencies clave: ${node.dependencies.join(", ")}\nNotas de Arquitectura: ${node.architectureNotes.join(" | ")}\nRegistro de Cambios:\n${changelog}\nTrace-events asociados:\n${traces}\nValidaciones:\n${validations}\nTrace Timeline:\n${timeline}`;
};
