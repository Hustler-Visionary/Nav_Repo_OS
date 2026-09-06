import type {
  PolicyBundle,
  PolicyCondition,
  PolicyConflict,
  PolicyDecision,
  PolicyDecisionRecord,
  PolicyDocument,
  PolicyEffect,
  PolicyEnforcementHook,
  PolicyEvaluationContext,
  PolicyPromotionRequest,
  PolicyRule,
  PolicySimulation
} from "./types.js";

const effectRank: Record<PolicyEffect, number> = {
  deny: 0,
  freeze: 1,
  quarantine: 2,
  require_escalation: 3,
  require_approval: 4,
  require_evidence: 5,
  require_rollback: 6,
  require_trace: 7,
  redact: 8,
  allow: 9
};

const matchesCondition = (condition: PolicyCondition, attributes: Record<string, string>): boolean => {
  const value = attributes[condition.field];
  if (typeof value !== "string") return false;
  if (typeof condition.equals === "string") return value === condition.equals;
  if (Array.isArray(condition.in)) return condition.in.includes(value);
  return false;
};

const matchesRule = (rule: PolicyRule, context: PolicyEvaluationContext): boolean =>
  rule.domain === context.domain &&
  rule.action === context.action &&
  rule.conditions.every((condition) => matchesCondition(condition, context.attributes));

export const loadPolicyBundle = (documents: PolicyDocument[]): PolicyBundle => ({ id: "bundle-runtime", documents });

export const detectPolicyConflicts = (document: PolicyDocument): PolicyConflict[] => {
  const conflicts: PolicyConflict[] = [];
  for (let i = 0; i < document.rules.length; i += 1) {
    for (let j = i + 1; j < document.rules.length; j += 1) {
      const a = document.rules[i]!;
      const b = document.rules[j]!;
      if (a.action === b.action && a.domain === b.domain && a.effect !== b.effect) {
        conflicts.push({
          domain: a.domain,
          action: a.action,
          conflictingRuleIds: [a.id, b.id],
          requiresGovernanceReview: true
        });
      }
    }
  }
  return conflicts;
};

export const evaluatePolicy = (bundle: PolicyBundle, context: PolicyEvaluationContext): PolicyDecision => {
  const rules = bundle.documents.flatMap((document) => document.rules);
  const matches = rules.filter((rule) => matchesRule(rule, context));
  if (matches.length === 0) return { effect: "deny", allowed: false, reason: "missing policy blocks action" };
  const chosen = [...matches].sort((a, b) => effectRank[a.effect] - effectRank[b.effect])[0]!;
  return {
    effect: chosen.effect,
    allowed: chosen.effect === "allow",
    reason: chosen.effect === "deny" ? "deny overrides allow" : `policy effect ${chosen.effect}`
  };
};

export const simulatePolicy = (bundle: PolicyBundle, contexts: PolicyEvaluationContext[]): PolicySimulation => ({
  requestId: "simulation-1",
  contexts,
  results: contexts.map((context) => evaluatePolicy(bundle, context))
});

export const canPromotePolicy = (document: PolicyDocument, request: PolicyPromotionRequest): boolean =>
  document.testsPassed && request.approved && document.approved;

export const invokePolicyHook = (
  hook: PolicyEnforcementHook,
  decision: PolicyDecision,
  context: PolicyEvaluationContext
): { allowed: boolean; reason: string } => {
  const ok = hook.invoke(decision, context);
  return ok ? { allowed: true, reason: "policy_hook_invoked" } : { allowed: false, reason: "policy_hook_failed" };
};

export const enforceWithHook = (
  hook: PolicyEnforcementHook,
  decision: PolicyDecision,
  context: PolicyEvaluationContext
): PolicyDecision => {
  const hookResult = invokePolicyHook(hook, decision, context);
  if (!hookResult.allowed) return { effect: "deny", allowed: false, reason: "hook failure deny-by-default" };
  return decision;
};

export const recordDecision = (recordId: string, context: PolicyEvaluationContext, decision: PolicyDecision, timestamp: string): PolicyDecisionRecord => ({
  id: recordId,
  context,
  decision,
  timestamp
});
