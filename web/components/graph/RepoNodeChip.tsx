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
    <div className="flex w-[164px] flex-col items-start gap-0.5">
      <Handle type="target" position={Position.Left} className="!bg-hud-border !border-0 !h-1 !w-1" />
      <Handle type="source" position={Position.Right} className="!bg-hud-border !border-0 !h-1 !w-1" />
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border bg-hud-bg/80 px-2 py-1 text-[11px] transition-transform",
          riskColor[node.risk],
          selected && "scale-105 ring-1 ring-hud-cyan"
        )}
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
        <span className="truncate font-medium">{node.name}</span>
      </div>
      <span className="pl-1 text-[9px] uppercase tracking-wider text-hud-textDim">{node.layer}</span>
    </div>
  );
};
