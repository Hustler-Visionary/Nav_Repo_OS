import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from "d3-force";
import type { GraphNode, GraphEdge } from "./types";

export type PositionedNode = GraphNode & { x: number; y: number };

type SimNode = { id: string; x: number; y: number; layer: string };
type SimLink = { source: string; target: string };

const LAYER_RADIAL_SPREAD = 620;

/**
 * Organic "memory graph" layout: nodes repel each other, edges pull connected
 * nodes together, and same-layer nodes are weakly attracted toward a shared
 * angular sector so clusters stay loosely readable without a rigid grid.
 */
export const layoutMemoryGraph = (nodes: GraphNode[], edges: GraphEdge[]): PositionedNode[] => {
  const layers = [...new Set(nodes.map((n) => n.layer))].sort();
  const layerAngle = new Map(layers.map((layer, i) => [layer, (i / layers.length) * Math.PI * 2]));

  const simNodes: SimNode[] = nodes.map((node, i) => {
    const angle = layerAngle.get(node.layer) ?? 0;
    return {
      id: node.id,
      layer: node.layer,
      x: Math.cos(angle) * LAYER_RADIAL_SPREAD + (Math.random() - 0.5) * 40,
      y: Math.sin(angle) * LAYER_RADIAL_SPREAD + (Math.random() - 0.5) * 40
    };
  });

  const simLinks: SimLink[] = edges.map((e) => ({ source: e.from, target: e.to }));

  const simulation = forceSimulation(simNodes as never[])
    .force(
      "link",
      forceLink(simLinks as never[])
        .id((d) => (d as SimNode).id)
        .distance(90)
        .strength(0.25)
    )
    .force("charge", forceManyBody().strength(-260).distanceMax(700))
    .force("collide", forceCollide().radius(58))
    .force("center", forceCenter(0, 0).strength(0.02))
    .force(
      "layerX",
      forceX<SimNode>((d) => Math.cos(layerAngle.get(d.layer) ?? 0) * LAYER_RADIAL_SPREAD).strength(0.06)
    )
    .force(
      "layerY",
      forceY<SimNode>((d) => Math.sin(layerAngle.get(d.layer) ?? 0) * LAYER_RADIAL_SPREAD).strength(0.06)
    )
    .stop();

  simulation.tick(360);

  const positionById = new Map(simNodes.map((n) => [n.id, n]));

  return nodes.map((node) => {
    const pos = positionById.get(node.id);
    return { ...node, x: pos?.x ?? 0, y: pos?.y ?? 0 };
  });
};
