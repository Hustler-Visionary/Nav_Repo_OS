import type { GraphNode } from "./types";

export type PositionedNode = GraphNode & { x: number; y: number };

const LAYER_COLS = 7;
const CELL_WIDTH = 380;
const CELL_HEIGHT = 260;
const NODE_SUB_COLS = 2;
const SUB_COL_WIDTH = 180;
const SUB_ROW_HEIGHT = 42;

export const layoutByLayer = (nodes: GraphNode[]): PositionedNode[] => {
  const layers = [...new Set(nodes.map((n) => n.layer))].sort();
  const layerIndex = new Map(layers.map((layer, i) => [layer, i]));
  const nodesPerLayer = new Map<string, number>();

  return nodes
    .slice()
    .sort((a, b) => a.layer.localeCompare(b.layer) || a.name.localeCompare(b.name))
    .map((node) => {
      const li = layerIndex.get(node.layer) ?? 0;
      const cellCol = li % LAYER_COLS;
      const cellRow = Math.floor(li / LAYER_COLS);
      const ni = nodesPerLayer.get(node.layer) ?? 0;
      nodesPerLayer.set(node.layer, ni + 1);
      const subCol = ni % NODE_SUB_COLS;
      const subRow = Math.floor(ni / NODE_SUB_COLS);

      return {
        ...node,
        x: cellCol * CELL_WIDTH + subCol * SUB_COL_WIDTH,
        y: cellRow * CELL_HEIGHT + subRow * SUB_ROW_HEIGHT
      };
    });
};
