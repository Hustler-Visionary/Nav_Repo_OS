import { createHash } from "node:crypto";
import type {
  GraphReasoningFrame,
  InstitutionalMemory,
  InstitutionalPattern,
  KnowledgeEdge,
  KnowledgeGovernanceRule,
  KnowledgeGraph,
  KnowledgeLineage,
  KnowledgeNode,
  KnowledgeProjection,
  KnowledgeReplay,
  KnowledgeSnapshot,
  SemanticIndex
} from "./types.js";

const hash = (value: string): string => createHash("sha256").update(value).digest("hex");

export const initializeKnowledgeGraph = (id: string, tenantId: string): KnowledgeGraph => ({ id, tenantId, nodes: [], edges: [] });

export const isLineageTrusted = (lineage: KnowledgeLineage): boolean => lineage.ancestorNodeIds.length > 0 || lineage.sourceEventIds.length > 0;

export const createKnowledgeNode = (graph: KnowledgeGraph, node: Omit<KnowledgeNode, "integrity">): KnowledgeGraph => {
  const integrity = { hash: hash(`${node.id}:${node.tenantId}:${node.label}`), verified: isLineageTrusted(node.lineage) };
  return { ...graph, nodes: [...graph.nodes, { ...node, integrity }] };
};

export const createKnowledgeEdge = (graph: KnowledgeGraph, edge: KnowledgeEdge): { valid: boolean; graph: KnowledgeGraph } => {
  const valid = edge.causal && edge.relationship.context.trim().length > 0;
  return { valid, graph: valid ? { ...graph, edges: [...graph.edges, edge] } : graph };
};

export const traverseSemantic = (graph: KnowledgeGraph, startNodeId: string): GraphReasoningFrame => {
  const traversed = graph.edges.filter((edge) => edge.from === startNodeId).map((edge) => edge.to).sort();
  return { startNodeId, traversedNodeIds: traversed, explanation: `Traversed ${traversed.length} semantic links` };
};

export const reconstructLineageDeterministic = (graph: KnowledgeGraph, nodeId: string): string[] => {
  const node = graph.nodes.find((candidate) => candidate.id === nodeId);
  if (!node) return [];
  return [...node.lineage.ancestorNodeIds, ...node.lineage.sourceEventIds].sort();
};

export const detectInstitutionalPatterns = (graph: KnowledgeGraph): InstitutionalPattern[] => {
  const riskNodes = graph.nodes.filter((node) => node.type === "risk").map((node) => node.id);
  if (riskNodes.length === 0) return [];
  return [{ id: "risk-cluster", description: "Risk knowledge cluster detected", nodeIds: riskNodes }];
};

export const verifyIntegrityProof = (node: KnowledgeNode): boolean => node.integrity.hash === hash(`${node.id}:${node.tenantId}:${node.label}`);

export const containGraphCorruption = (graph: KnowledgeGraph): boolean => graph.nodes.every((node) => verifyIntegrityProof(node));

export const replayKnowledgePreservingLineage = (graph: KnowledgeGraph): KnowledgeReplay => ({
  tenantId: graph.tenantId,
  nodeOrder: [...graph.nodes]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((node) => `${node.id}:${reconstructLineageDeterministic(graph, node.id).join("|")}`)
});

export const updateKnowledgeConfidence = (node: KnowledgeNode, evidenceRefs: string[], nextScore: number): KnowledgeNode => ({
  ...node,
  confidence: { score: evidenceRefs.length > 0 ? nextScore : node.confidence.score, evidenceRefs }
});

export const promoteInstitutionalMemory = (
  memory: InstitutionalMemory,
  nodeId: string,
  approved: boolean,
  rule: KnowledgeGovernanceRule
): InstitutionalMemory => {
  if (rule.requirePromotionApproval && !approved) return memory;
  return { ...memory, promotedNodeIds: [...memory.promotedNodeIds, nodeId] };
};

export const enforceTenantIsolation = (graph: KnowledgeGraph, tenantId: string): boolean => graph.tenantId === tenantId;

export const enforceRetentionAndLegalHold = (memory: InstitutionalMemory): boolean => memory.legalHoldActive;

export const projectKnowledge = (graph: KnowledgeGraph): KnowledgeProjection => {
  const covered = graph.nodes.filter((node) => isLineageTrusted(node.lineage)).length;
  return { nodeCount: graph.nodes.length, edgeCount: graph.edges.length, lineageCoverage: graph.nodes.length === 0 ? 0 : covered / graph.nodes.length };
};

export const createSemanticIndex = (graph: KnowledgeGraph): SemanticIndex => ({
  byType: graph.nodes.reduce<Record<string, string[]>>((acc, node) => ({ ...acc, [node.type]: [...(acc[node.type] ?? []), node.id] }), {})
});

export const createKnowledgeSnapshot = (graph: KnowledgeGraph): KnowledgeSnapshot => ({
  tenantId: graph.tenantId,
  nodeCount: graph.nodes.length,
  edgeCount: graph.edges.length
});
