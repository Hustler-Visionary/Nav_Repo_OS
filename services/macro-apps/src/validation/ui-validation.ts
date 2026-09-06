import { selectActiveNode, selectVisibleNodes } from "../selectors.js";
import { storeActions, type AppState } from "../store.js";
import type { TraceEvent } from "@tst-autonomous/kernel";

export type CanvasValidationResult = {
  ok: boolean;
  diagnostics: string[];
  ruleCandidate?: string;
};

const createEvent = (type: "ui_validation_started" | "ui_validation_passed" | "ui_validation_failed", details: string): TraceEvent => ({
  id: `${type}-${Date.now()}`,
  type,
  timestamp: new Date().toISOString(),
  actor: "system",
  details
});

export const validateCanvasUI = (state: AppState): { state: AppState; result: CanvasValidationResult } => {
  let currentState = storeActions.publishTrace(state, createEvent("ui_validation_started", "starting UI validation"));
  const diagnostics: string[] = [];
  const visibleNodes = selectVisibleNodes(currentState);
  const activeNode = selectActiveNode(currentState);

  if (visibleNodes.length === 0) diagnostics.push("No hay nodos visibles");
  if (!activeNode && currentState.repoSlice.selectedNodeId) diagnostics.push("Estado seleccionado inválido");

  if (activeNode) {
    if (activeNode.traceEvents.length === 0) diagnostics.push("Nodo sin trace-events visibles");
    if (activeNode.confidence < 0 || activeNode.confidence > 1) diagnostics.push("Confidence fuera de rango");
  }

  if (diagnostics.length > 0) {
    currentState = storeActions.publishTrace(currentState, createEvent("ui_validation_failed", diagnostics.join(" | ")));
    return {
      state: {
        ...currentState,
        uiValidationSlice: {
          ...currentState.uiValidationSlice,
          isValid: false,
          retryCount: currentState.uiValidationSlice.retryCount + 1,
          lastDiagnostic: diagnostics.join(" | ")
        }
      },
      result: { ok: false, diagnostics, ruleCandidate: "Crear regla de layout/trace para nodos sin metadata visible" }
    };
  }

  currentState = storeActions.publishTrace(currentState, createEvent("ui_validation_passed", "ui validation passed"));
  return {
    state: { ...currentState, uiValidationSlice: { ...currentState.uiValidationSlice, isValid: true, lastDiagnostic: undefined } },
    result: { ok: true, diagnostics: [] }
  };
};
