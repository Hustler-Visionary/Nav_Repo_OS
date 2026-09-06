import { buildDomainGraph } from "./graph";
import type { Intent } from "./semantic-firewall";
import { runVerticalSliceDeterministic, createProductShell } from "../../src/domain/product-consolidation/engine.js";
import { renderProductShell } from "../../src/components/product/ProductShell.js";

export type IntentResult = { ok: true; summary: string; data?: unknown } | { ok: false; summary: string };

/**
 * Maps a firewall-approved Intent to a real src/domain function call. This is
 * the only place background-executed intents turn into code execution, and
 * every branch here is a fixed, pre-defined, read-only domain function --
 * never eval, never shell-out, never a dynamically chosen function.
 */
export const executeIntent = async (intent: Intent): Promise<IntentResult> => {
  switch (intent.type) {
    case "refresh_graph": {
      const graph = await buildDomainGraph();
      const layers = new Set(graph.nodes.map((n) => n.layer)).size;
      return {
        ok: true,
        summary: `graph refreshed: ${graph.nodes.length} nodes / ${graph.edges.length} edges across ${layers} layers (${graph.scannedRoot})`,
        data: { nodes: graph.nodes.length, edges: graph.edges.length, layers }
      };
    }

    case "search": {
      const graph = await buildDomainGraph();
      const term = intent.term.toLowerCase();
      const matches = graph.nodes
        .filter((n) => n.name.toLowerCase().includes(term) || n.path.toLowerCase().includes(term) || n.layer.toLowerCase().includes(term))
        .slice(0, 15);
      if (matches.length === 0) return { ok: true, summary: `no nodes match "${intent.term}"` };
      return {
        ok: true,
        summary: `${matches.length} match(es) for "${intent.term}":\n${matches.map((m) => `  ${m.path}  (risk:${m.risk} confidence:${m.confidence})`).join("\n")}`,
        data: matches
      };
    }

    case "inspect_node": {
      const graph = await buildDomainGraph();
      const q = intent.query.toLowerCase();
      const node = graph.nodes.find((n) => n.path.toLowerCase() === q || n.path.toLowerCase().endsWith(`/${q}`) || n.name.toLowerCase() === q);
      if (!node) return { ok: true, summary: `no node found for "${intent.query}"` };
      return {
        ok: true,
        summary: `${node.path}\n  layer: ${node.layer}\n  type: ${node.artifactType}\n  risk: ${node.risk}  cost: ${node.cost}  confidence: ${node.confidence}\n  loc: ${node.loc}  in-degree: ${node.inDegree}  out-degree: ${node.outDegree}`,
        data: node
      };
    }

    case "run_scenario": {
      const scenario = runVerticalSliceDeterministic(intent.goal);
      const shell = createProductShell(scenario.id);
      return { ok: true, summary: renderProductShell(shell, scenario), data: scenario };
    }
  }
};
