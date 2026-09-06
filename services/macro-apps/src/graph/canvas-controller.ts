import { selectActiveNode } from "../selectors.js";
import { storeActions, type AppState } from "../store.js";
import type { TraceEvent, TraceEventType } from "@tst-autonomous/kernel";

const makeEvent = (type: TraceEventType, details: string, nodeId?: string): TraceEvent => {
  const baseEvent = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    timestamp: new Date().toISOString(),
    actor: "human" as const,
    details
  };
  return nodeId ? { ...baseEvent, nodeId } : baseEvent;
};

export const openNode = (state: AppState, nodeId: string): AppState => {
  const nextState = storeActions.selectNode(state, nodeId);
  return storeActions.publishTrace(nextState, makeEvent("node_opened", `node opened: ${nodeId}`, nodeId));
};

export const changeTab = (state: AppState, tab: "code" | "description"): AppState => {
  const nextState = storeActions.setTab(state, tab);
  const activeNode = selectActiveNode(nextState);
  return storeActions.publishTrace(nextState, makeEvent("tab_changed", `tab changed to ${tab}`, activeNode?.id));
};

export const executeSearch = (state: AppState, search: string): AppState => {
  const nextState = storeActions.setSearch(state, search);
  return storeActions.publishTrace(nextState, makeEvent("search_executed", `search=${search}`));
};

export const navigateDependency = (state: AppState, fromNodeId: string, dependencyNodeId: string): AppState => {
  const owner = state.repoSlice.nodes.find((node) => node.id === fromNodeId);
  if (!owner || !owner.dependencies.includes(dependencyNodeId)) {
    return storeActions.publishTrace(state, makeEvent("validation_gate_failed", "dependency navigation blocked"));
  }
  const opened = openNode(state, dependencyNodeId);
  return storeActions.publishTrace(opened, makeEvent("dependency_navigated", `${fromNodeId} -> ${dependencyNodeId}`, dependencyNodeId));
};

export const panZoom = (state: AppState, zoom: number, panX: number, panY: number): AppState => storeActions.setZoomPan(state, zoom, panX, panY);
