import { createHash } from "node:crypto";
import type {
  ConstitutionalAuthority,
  ConstitutionalCharter,
  ConstitutionalDecision,
  ConstitutionalEscalation,
  ConstitutionalFreeze,
  ConstitutionalFreezeMode,
  ConstitutionalInvariant,
  ConstitutionalInvariantKey,
  ConstitutionalLineage,
  ConstitutionalOverrideRequest,
  ConstitutionalRecoveryPlan,
  ConstitutionalSnapshot,
  ConstitutionalViolation,
  SovereignBoundary
} from "./types.js";

const precedence: Record<string, number> = {
  constitution: 0,
  governance: 1,
  policy_runtime: 2,
  cognitive_kernel: 3,
  runtime: 4,
  agents: 5,
  ui: 6
};

const h = (v: string): string => createHash("sha256").update(v).digest("hex");

export const loadConstitutionalCharter = (charter: ConstitutionalCharter): ConstitutionalCharter => charter;

export const validateInvariant = (invariant: ConstitutionalInvariant, context: Record<string, string>): boolean => {
  if (invariant.key === "semantic_firewall_never_bypassed") return context.semanticFirewall === "active";
  if (invariant.key === "deny_by_default") return context.defaultDecision === "deny";
  if (invariant.key === "rollback_before_mutation") return context.rollbackReady === "true";
  return true;
};

export const validateConstitutionalBoundary = (boundaries: SovereignBoundary[], level: string, action: string): boolean => {
  const boundary = boundaries.find((b) => b.level === level);
  if (!boundary) return true;
  return !boundary.blockedActions.includes(action);
};

export const evaluateConstitutionalDecision = (
  charter: ConstitutionalCharter,
  context: { level: string; action: string; attributes: Record<string, string> }
): ConstitutionalDecision => {
  const boundaryAllowed = validateConstitutionalBoundary(charter.boundaries, context.level, context.action);
  if (!boundaryAllowed) return { allowed: false, reason: "constitutional boundary blocked", enforcedBy: "sovereign" };
  const invalid = charter.invariants.find((inv) => !validateInvariant(inv, context.attributes));
  if (invalid) return { allowed: false, reason: `invariant violated: ${invalid.key}`, enforcedBy: invalid.level };
  return { allowed: true, reason: "constitutional decision allow", enforcedBy: "operational" };
};

export const detectConstitutionalViolation = (
  decision: ConstitutionalDecision,
  invariant: ConstitutionalInvariantKey,
  action: string
): ConstitutionalViolation | undefined =>
  decision.allowed ? undefined : { invariant, action, details: decision.reason };

export const freezeRuntime = (mode: ConstitutionalFreezeMode): ConstitutionalFreeze => ({ mode, active: true });
export const freezeTenant = (): ConstitutionalFreeze => ({ mode: "tenant_freeze", active: true });

export const triggerConstitutionalEscalation = (violation: ConstitutionalViolation): ConstitutionalEscalation => ({
  id: `esc-${violation.invariant}`,
  violation,
  started: true
});

export const createConstitutionalSnapshot = (lineage: ConstitutionalLineage, frozenModes: ConstitutionalFreezeMode[]): ConstitutionalSnapshot => ({
  id: `snap-${lineage.chain.length}`,
  lineageHash: lineage.integrityHash,
  frozenModes
});

export const replayConstitutionalDecision = (decisions: ConstitutionalDecision[]): string[] =>
  decisions.map((decision) => `${decision.allowed}:${decision.reason}:${decision.enforcedBy}`).sort();

export const verifyConstitutionalLineage = (lineage: ConstitutionalLineage): boolean => h(lineage.chain.join("|")) === lineage.integrityHash;

export const recoverFromConstitutionalViolation = (
  plan: ConstitutionalRecoveryPlan,
  snapshot: ConstitutionalSnapshot,
  lineage: ConstitutionalLineage
): boolean => plan.rollbackToSnapshotId === snapshot.id && verifyConstitutionalLineage(lineage);

export const rejectOverrideWithoutAuthority = (request: ConstitutionalOverrideRequest): boolean => request.requestedBy !== "sovereign";

export const enforceConstitutionalPrecedence = (higher: keyof typeof precedence, lower: keyof typeof precedence): boolean => {
  const hRank = precedence[higher];
  const lRank = precedence[lower];
  return typeof hRank === "number" && typeof lRank === "number" && hRank < lRank;
};

export const requireRollbackBeforeMutation = (rollbackReady: boolean): boolean => rollbackReady;
export const noBypassSemanticFirewall = (semanticFirewallActive: boolean): boolean => semanticFirewallActive;
export const denyByDefaultConstitutional = (hasDecision: boolean): boolean => hasDecision;
