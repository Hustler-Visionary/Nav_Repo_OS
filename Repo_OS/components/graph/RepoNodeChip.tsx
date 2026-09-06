"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { cn } from "../../lib/utils";
import type { GraphNode } from "../../lib/types";

const riskColor: Record<GraphNode["risk"], string> = {
  low: "border-hud-cyan text-hud-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]",
  medium: "border-hud-amber text-hud-amber shadow-[0_0_10px_rgba(251,191,36,0.5)]",
  high: "border-hud-magenta text-hud-magenta shadow-[0_0_10px_rgba(232,121,249,0.5)]"
};

export type RepoNodeChipData = { node: GraphNode; selected: boolean };
export type RepoFlowNode = Node<RepoNodeChipData, "repoNode">;

export const RepoNodeChip = ({ data }: NodeProps<RepoFlowNode>) => {
  const { node, selected } = data;
  return (
    <div className="relative flex h-9 w-9 items-center justify-center">
      <Handle type="target" position={Position.Left} className="!bg-hud-border !border-0 !h-1 !w-1" />
      <Handle type="source" position={Position.Right} className="!bg-hud-border !border-0 !h-1 !w-1" />
      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full border-2 bg-hud-bg/90 transition-transform",
          riskColor[node.risk],
          selected && "scale-110 ring-2 ring-hud-cyan"
        )}
      >
        <span className="h-2 w-2 rounded-full bg-current" />
      </div>
      <div className="pointer-events-none absolute top-full mt-1 flex flex-col items-center whitespace-nowrap">
        <span className="text-[10px] font-medium text-hud-text">{node.name}</span>
        <span className="text-[8px] uppercase tracking-wider text-hud-textDim">{node.layer}</span>
      </div>
    </div>
  );
};
