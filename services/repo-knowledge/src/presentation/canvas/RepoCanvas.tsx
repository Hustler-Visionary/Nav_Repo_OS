import type { RepoNode } from "../../repo/types.js";

export type RepoCanvasProps = {
  nodes: RepoNode[];
  selectedNodeId?: string;
  zoom: number;
  panX: number;
  panY: number;
  search: string;
};

export const renderRepoCanvas = (props: RepoCanvasProps): string => {
  const visibleNodes = props.nodes
    .filter((node) => {
      const term = props.search.toLowerCase();
      return term.length === 0 || node.path.toLowerCase().includes(term) || node.name.toLowerCase().includes(term) || node.layer.toLowerCase().includes(term);
    })
    .map((node) => `${node.id === props.selectedNodeId ? "▶" : "•"} [${node.layer}] ${node.name} (${node.artifactType}) risk:${node.risk} confidence:${node.confidence} cost:${node.cost}`)
    .join("\n");

  return `Canvas Operacional\nzoom:${props.zoom.toFixed(2)} pan:(${props.panX},${props.panY})\n${visibleNodes}`;
};

export const renderHudMiniMap = (nodes: RepoNode[]): string => {
  const layerCount = nodes.reduce<Record<string, number>>((acc, node) => {
    const current = acc[node.layer] ?? 0;
    return { ...acc, [node.layer]: current + 1 };
  }, {});

  const summary = Object.entries(layerCount)
    .map(([layer, count]) => `${layer}:${count}`)
    .join(" | ");

  return `HUD MiniMap => ${summary}`;
};
