"use client";

import { useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type Edge
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RepoNodeChip, type RepoFlowNode } from "./RepoNodeChip";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { layoutMemoryGraph } from "../../lib/layout";
import type { GraphNode, RepoGraph } from "../../lib/types";

const nodeTypes = { repoNode: RepoNodeChip };

export const RepoGraphCanvas = ({ graph, error }: { graph: RepoGraph | null; error: string | null }) => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const positioned = useMemo(() => (graph ? layoutMemoryGraph(graph.nodes, graph.edges) : []), [graph]);

  const matches = useCallback(
    (node: GraphNode) => {
      const term = search.trim().toLowerCase();
      if (term.length === 0) return true;
      return node.name.toLowerCase().includes(term) || node.layer.toLowerCase().includes(term) || node.path.toLowerCase().includes(term);
    },
    [search]
  );

  const nodes: RepoFlowNode[] = positioned.map((node) => ({
    id: node.id,
    type: "repoNode",
    position: { x: node.x, y: node.y },
    data: { node, selected: node.id === selectedId },
    style: { opacity: matches(node) ? 1 : 0.15 }
  }));

  const edges: Edge[] =
    graph?.edges.map((edge, i) => ({
      id: `${edge.from}->${edge.to}-${i}`,
      source: edge.from,
      target: edge.to,
      animated: edge.from === selectedId || edge.to === selectedId,
      style: {
        stroke: edge.from === selectedId || edge.to === selectedId ? "#22d3ee" : "#1b2a38",
        strokeWidth: edge.from === selectedId || edge.to === selectedId ? 1.5 : 1
      }
    })) ?? [];

  const selectedNode = graph?.nodes.find((n) => n.id === selectedId) ?? null;

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH_NODES..."
          className="w-64 rounded-sm border border-hud-border bg-hud-panel/90 px-2 py-1 text-[11px] text-hud-text placeholder:text-hud-textDim focus:border-hud-cyan focus:outline-none"
        />
        {graph && (
          <span className="rounded-sm border border-hud-border bg-hud-panel/80 px-2 py-1 text-[10px] text-hud-textDim">
            {graph.nodes.length} nodes / {graph.edges.length} edges &middot; {graph.scannedRoot}
          </span>
        )}
        {error && <span className="rounded-sm border border-hud-red/40 bg-hud-red/10 px-2 py-1 text-[10px] text-hud-red">{error}</span>}
      </div>

      {!graph && !error && (
        <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-hud-textDim">
          Loading domain graph...
        </div>
      )}

      {graph && (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedId(node.id)}
          onPaneClick={() => setSelectedId(null)}
          fitView
          minZoom={0.1}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} color="#12202b" gap={24} size={1} />
          <Controls className="!bg-hud-panel !border-hud-border [&>button]:!bg-hud-panel [&>button]:!border-hud-border [&>button]:!text-hud-cyan" />
        </ReactFlow>
      )}

      {selectedNode && <NodeDetailPanel node={selectedNode} onClose={() => setSelectedId(null)} />}
    </div>
  );
};
