"use client";

import { useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type Edge
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RepoNodeChip, type RepoFlowNode } from "./RepoNodeChip";
import { layoutMemoryGraph } from "../../lib/layout";
import type { GraphNode, RepoGraph } from "../../lib/types";

const nodeTypes = { repoNode: RepoNodeChip };

// Code-split the whole detail panel (Monaco, its worker/loader setup, framer-motion)
// into its own chunk that only downloads once a node is actually opened.
const NodeDetailPanel = dynamic(() => import("./NodeDetailPanel").then((m) => m.NodeDetailPanel), {
  ssr: false,
  loading: () => (
    <div className="glass-panel-strong absolute right-3 top-3 z-20 w-[420px] rounded-2xl px-3 py-2 text-[10px] uppercase tracking-widest text-hud-textDim">
      Loading panel...
    </div>
  )
});

export const RepoGraphCanvas = ({ graph, error }: { graph: RepoGraph | null; error: string | null }) => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openNodeId, setOpenNodeId] = useState<string | null>(null);

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

  const openNode = graph?.nodes.find((n) => n.id === openNodeId) ?? null;

  /** Double-click opens the detail panel, but only for nodes backed by a real file on disk. */
  const handleNodeDoubleClick = (node: GraphNode | undefined) => {
    if (!node || !node.path) return;
    setOpenNodeId(node.id);
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH_NODES..."
          className="glass-panel-strong w-64 rounded-full px-3 py-1.5 text-[11px] text-hud-text placeholder:text-hud-textDim focus:outline-none focus:ring-1 focus:ring-hud-cyan/50"
        />
        {graph && (
          <span className="glass-panel-strong rounded-full px-3 py-1.5 text-[10px] text-hud-textDim">
            {graph.nodes.length} nodes / {graph.edges.length} edges &middot; {graph.scannedRoot}
          </span>
        )}
        {error && <span className="glass-panel-strong !border-hud-red/40 rounded-full px-3 py-1.5 text-[10px] text-hud-red">{error}</span>}
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
          onNodeDoubleClick={(_, node) => handleNodeDoubleClick((node.data as { node: GraphNode }).node)}
          onPaneClick={() => {
            setSelectedId(null);
            setOpenNodeId(null);
          }}
          fitView
          minZoom={0.1}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} color="#16283a" gap={24} size={1} />
          <Controls className="!overflow-hidden !rounded-xl !border !border-white/10 !bg-hud-panel/50 !shadow-glass !backdrop-blur-xl [&>button]:!border-white/8 [&>button]:!bg-transparent [&>button]:!text-hud-cyan [&>button:hover]:!bg-hud-cyan/10" />
        </ReactFlow>
      )}

      {openNode && <NodeDetailPanel node={openNode} onClose={() => setOpenNodeId(null)} />}
    </div>
  );
};
