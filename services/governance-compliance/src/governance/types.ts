import type { TraceEventType } from "@tst-autonomous/kernel";

export type ApprovalLevel = "none" | "human_gate" | "governance_review";

export type ApprovalPackage = {
  id: string;
  commandId: string;
  interpretedIntent: string;
  technicalPlan: string;
  affectedNodes: string[];
  affectedFiles: string[];
  risk: "low" | "medium" | "high";
  cost: "low" | "medium" | "high";
  confidence: number;
  expectedTraceEvents: TraceEventType[];
  expectedValidations: string[];
  rollbackPlan: string;
  humanDecision: "pending" | "approved" | "rejected";
};

export type RuleCandidate = {
  id: string;
  scope: "node" | "global";
  nodeId?: string;
  summary: string;
  createdFrom: string;
  status: "draft" | "governance_review";
};

export type EvolutionProposal = {
  id: string;
  sourceFailureId: string;
  ruleCandidateId: string;
  summary: string;
  proposedChange: string;
  affectedModules: string[];
  risk: "low" | "medium" | "high";
  status: "draft" | "governance_review" | "approved" | "rejected";
  traceEvents: string[];
};
