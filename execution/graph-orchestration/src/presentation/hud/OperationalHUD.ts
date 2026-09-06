import type { RepoMode } from "@tst-autonomous/repo-knowledge";
import type { WorkflowState } from "@tst-autonomous/governance-compliance";
import type { TraceEvent } from "@tst-autonomous/kernel";
import type { ExecutionGraph } from "../../graph-orchestration/types.js";

/**
 * Narrowed to the exact AppState fields this HUD reads (repoMode, governance
 * state, trace events) instead of importing the full composed AppState from
 * macro-apps -- keeps this package from depending on the composition root.
 */
type HudState = { repoSlice: { repoMode: RepoMode }; governanceSlice: { state: WorkflowState }; traceSlice: { events: TraceEvent[] } };

export const renderOperationalHUD = (state: HudState, graph: ExecutionGraph, traceThroughputPerSec: number): string => {
  const activeExecution = graph.nodes.filter((n) => n.state === "EXECUTING").length;
  const blocked = graph.nodes.filter((n) => n.state === "BLOCKED").length;
  const escalated = graph.nodes.filter((n) => n.state === "ESCALATED").length;
  const activeAgents = new Set(graph.nodes.map((n) => n.ownerAgent)).size;
  const validationFailures = state.traceSlice.events.filter((e) => e.type === "validation_gate_failed").length;
  return `TOP|mode:${state.repoSlice.repoMode} gov:${state.governanceSlice.state} active:${activeExecution} blocked:${blocked} escalations:${escalated} validationFailures:${validationFailures} activeAgents:${activeAgents} throughput:${traceThroughputPerSec}`;
};
