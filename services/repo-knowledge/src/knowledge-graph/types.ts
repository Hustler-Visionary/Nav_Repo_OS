export type KnowledgeNodeType =
  | "decision"
  | "trace-event"
  | "proposal"
  | "policy"
  | "contract"
  | "workflow"
  | "debate"
  | "rationale"
  | "evidence"
  | "tenant"
  | "incident"
  | "evolution"
  | "risk"
  | "mitigation"
  | "objective"
  | "replay"
  | "audit"
  | "governance";

export type KnowledgeConfidence = {
  score: number;
  evidenceRefs: string[];
};

export type KnowledgeLineage = {
  ancestorNodeIds: string[];
  sourceEventIds: string[];
};

export type KnowledgeIntegrityProof = {
  hash: string;
  verified: boolean;
};

export type KnowledgeNode = {
  id: string;
  tenantId: string;
  type: KnowledgeNodeType;
  label: string;
  lineage: KnowledgeLineage;
  confidence: KnowledgeConfidence;
  integrity: KnowledgeIntegrityProof;
};

export type SemanticRelationship = {
  relation: "causes" | "supports" | "contradicts" | "depends_on" | "mitigates" | "governs";
  context: string;
};

export type KnowledgeEdge = {
  id: string;
  tenantId: string;
  from: string;
  to: string;
  relationship: SemanticRelationship;
  causal: boolean;
};

export type KnowledgeGraph = {
  id: string;
  tenantId: string;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
};

export type InstitutionalMemory = {
  tenantId: string;
  promotedNodeIds: string[];
  legalHoldActive: boolean;
};

export type KnowledgeProjection = {
  nodeCount: number;
  edgeCount: number;
  lineageCoverage: number;
};

export type SemanticIndex = {
  byType: Record<string, string[]>;
};

export type GraphReasoningFrame = {
  startNodeId: string;
  traversedNodeIds: string[];
  explanation: string;
};

export type InstitutionalPattern = {
  id: string;
  description: string;
  nodeIds: string[];
};

export type KnowledgeGovernanceRule = {
  requirePromotionApproval: boolean;
};

export type KnowledgePromotion = {
  nodeId: string;
  approved: boolean;
};

export type KnowledgeReplay = {
  tenantId: string;
  nodeOrder: string[];
};

export type KnowledgeSnapshot = {
  tenantId: string;
  nodeCount: number;
  edgeCount: number;
};
