export type PolicyEffect =
  | "allow"
  | "deny"
  | "require_approval"
  | "require_evidence"
  | "require_rollback"
  | "require_escalation"
  | "require_trace"
  | "quarantine"
  | "redact"
  | "freeze";

export type PolicyDomain =
  | "repo"
  | "apply"
  | "deployment"
  | "tenant"
  | "security"
  | "compliance"
  | "cognition"
  | "knowledge"
  | "distributed-fabric"
  | "runtime"
  | "billing"
  | "storage";

export type PolicyCondition = {
  field: string;
  equals?: string;
  in?: string[];
};

export type PolicyRule = {
  id: string;
  domain: PolicyDomain;
  action: string;
  conditions: PolicyCondition[];
  effect: PolicyEffect;
};

export type PolicyVersion = {
  major: number;
  minor: number;
  patch: number;
};

export type PolicyDocument = {
  id: string;
  domain: PolicyDomain;
  version: PolicyVersion;
  rules: PolicyRule[];
  approved: boolean;
  testsPassed: boolean;
};

export type PolicyBundle = {
  id: string;
  documents: PolicyDocument[];
};

export type PolicyEvaluationContext = {
  tenantId: string;
  domain: PolicyDomain;
  action: string;
  attributes: Record<string, string>;
};

export type PolicyDecision = {
  effect: PolicyEffect;
  allowed: boolean;
  reason: string;
};

export type PolicyDecisionRecord = {
  id: string;
  context: PolicyEvaluationContext;
  decision: PolicyDecision;
  timestamp: string;
};

export type PolicyConflict = {
  domain: PolicyDomain;
  action: string;
  conflictingRuleIds: string[];
  requiresGovernanceReview: true;
};

export type PolicySimulation = {
  requestId: string;
  contexts: PolicyEvaluationContext[];
  results: PolicyDecision[];
};

export type PolicyPromotionRequest = {
  documentId: string;
  requestedBy: string;
  approved: boolean;
};

export type PolicyEnforcementHook = {
  id: string;
  domain: PolicyDomain;
  invoke: (decision: PolicyDecision, context: PolicyEvaluationContext) => boolean;
};
