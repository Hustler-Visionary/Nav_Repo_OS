export type ConstitutionalLevel =
  | "sovereign"
  | "governance"
  | "operational"
  | "runtime"
  | "tenant"
  | "security"
  | "cognition"
  | "evolution";

export type ConstitutionalInvariantKey =
  | "human_governance_supremacy"
  | "semantic_firewall_never_bypassed"
  | "no_unsafe_runtime_execution"
  | "no_unbounded_autonomy"
  | "rollback_before_mutation"
  | "evidence_before_apply"
  | "trace_before_acceptance"
  | "deny_by_default"
  | "no_cross_tenant_leakage"
  | "no_policyless_execution"
  | "no_self_certification"
  | "no_unverified_promotion"
  | "no_unbounded_retry"
  | "governance_before_evolution"
  | "constitutional_precedence_over_policy"
  | "constitutional_precedence_over_agents"
  | "constitutional_precedence_over_runtime";

export type ConstitutionalInvariant = {
  key: ConstitutionalInvariantKey;
  level: ConstitutionalLevel;
  description: string;
};

export type SovereignBoundary = {
  level: ConstitutionalLevel;
  blockedActions: string[];
};

export type ConstitutionalAuthority = "none" | "operator" | "admin" | "sovereign";

export type ConstitutionalCharter = {
  id: string;
  version: string;
  invariants: ConstitutionalInvariant[];
  boundaries: SovereignBoundary[];
};

export type ConstitutionalDecision = {
  allowed: boolean;
  reason: string;
  enforcedBy: ConstitutionalLevel;
};

export type ConstitutionalViolation = {
  invariant: ConstitutionalInvariantKey;
  action: string;
  details: string;
};

export type ConstitutionalOverrideRequest = {
  id: string;
  requestedBy: ConstitutionalAuthority;
  reason: string;
};

export type ConstitutionalReview = {
  id: string;
  approved: boolean;
  authority: ConstitutionalAuthority;
};

export type ConstitutionalProof = {
  invariant: ConstitutionalInvariantKey;
  passed: boolean;
  evidenceRefs: string[];
};

export type ConstitutionalAudit = {
  id: string;
  decision: ConstitutionalDecision;
  timestamp: string;
};

export type ConstitutionalFreezeMode =
  | "runtime_freeze"
  | "tenant_freeze"
  | "deployment_freeze"
  | "evolution_freeze"
  | "cognition_freeze"
  | "global_emergency_freeze";

export type ConstitutionalFreeze = {
  mode: ConstitutionalFreezeMode;
  active: boolean;
};

export type ConstitutionalEscalation = {
  id: string;
  violation: ConstitutionalViolation;
  started: boolean;
};

export type ConstitutionalSnapshot = {
  id: string;
  lineageHash: string;
  frozenModes: ConstitutionalFreezeMode[];
};

export type ConstitutionalRecoveryPlan = {
  id: string;
  rollbackToSnapshotId: string;
  replayViolationChain: string[];
};

export type ConstitutionalLineage = {
  chain: string[];
  integrityHash: string;
};
