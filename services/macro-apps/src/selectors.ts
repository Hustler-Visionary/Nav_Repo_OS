import type { AppState } from "./store.js";

export const selectVisibleNodes = (state: AppState) => {
  const { search, activeLayer } = state.graphSlice.view;
  const normalizedSearch = search.toLowerCase();
  return state.repoSlice.nodes.filter((node) => {
    const byLayer = activeLayer === "all" || node.layer === activeLayer;
    const bySearch =
      normalizedSearch.length === 0 ||
      node.name.toLowerCase().includes(normalizedSearch) ||
      node.path.toLowerCase().includes(normalizedSearch) ||
      node.artifactType.toLowerCase().includes(normalizedSearch) ||
      node.layer.toLowerCase().includes(normalizedSearch);
    return byLayer && bySearch;
  });
};

export const selectActiveNode = (state: AppState) => state.repoSlice.nodes.find((n) => n.id === state.repoSlice.selectedNodeId);

export const selectNodeDependencies = (state: AppState, nodeId: string) => {
  const node = state.repoSlice.nodes.find((currentNode) => currentNode.id === nodeId);
  if (!node) {
    return [];
  }
  return node.dependencies
    .map((dependencyId) => state.repoSlice.nodes.find((candidate) => candidate.id === dependencyId))
    .filter((candidate) => candidate !== undefined);
};
