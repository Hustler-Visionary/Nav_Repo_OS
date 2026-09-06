import type {
  RuntimeExecutionAuthority,
  RuntimeExecutionContext,
  RuntimeExecutionDecision,
  RuntimeExecutionFailure,
  RuntimeExecutionKnowledgeUpdate,
  RuntimeExecutionLedgerRecord,
  RuntimeExecutionLock,
  RuntimeExecutionPipeline,
  RuntimeExecutionPlan,
  RuntimeExecutionReceipt,
  RuntimeExecutionReplay,
  RuntimeExecutionRequest,
  RuntimeExecutionResult,
  RuntimeExecutionRollback,
  RuntimeExecutionStage,
  UnifiedRuntimeKernel
} from "./types.js";

const STAGES: RuntimeExecutionStage[] = ["human_goal_received","cognitive_interpretation","policy_evaluation","constitutional_evaluation","mcp_capability_resolution","reality_boundary_validation","sandbox_preparation","execution_preview","approval_package_generation","approval_verification","controlled_execution","verification","rollback_readiness_check","ledger_recording","knowledge_graph_update","replay_materialization","operator_summary"];

export const createUnifiedRuntimeKernel = (): UnifiedRuntimeKernel => ({
  id: "unified-kernel-v1",
  boundary: { tenantProjectRequired: true, externalThroughMCPRequired: true, secretByReferenceOnly: true },
  authority: { policyRequired: true, constitutionalRequired: true, denyByDefault: true },
  pipelineTemplate: [...STAGES]
});

export const createRuntimeExecutionRequest = (request: RuntimeExecutionRequest): RuntimeExecutionRequest => request;
export const buildRuntimeExecutionPlan = (request: RuntimeExecutionRequest): RuntimeExecutionPlan => ({ requestId: request.id, stages: [...STAGES] });
export const validateRuntimeExecutionContext = (context: RuntimeExecutionContext): boolean => context.request.tenantId.length > 0 && context.request.projectId.length > 0;

export const evaluateRuntimeAuthority = (request: RuntimeExecutionRequest, authority: RuntimeExecutionAuthority): RuntimeExecutionDecision => {
  if (authority.denyByDefault && (!request.policyDecisionPassed || !request.constitutionalDecisionPassed)) return { allow: false, reason: "deny_by_default_missing_decision" };
  if (authority.policyRequired && !request.policyDecisionPassed) return { allow: false, reason: "policy_required" };
  if (authority.constitutionalRequired && !request.constitutionalDecisionPassed) return { allow: false, reason: "constitutional_required" };
  return { allow: true, reason: "allowed" };
};

export const executeUnifiedPipeline = (kernel: UnifiedRuntimeKernel, context: RuntimeExecutionContext): RuntimeExecutionResult => {
  if (context.frozen) return { receipt: { requestId: context.request.id, status: "frozen", replayable: true, ledgerRecorded: false }, operatorSummary: "execution frozen" };
  if (!validateRuntimeExecutionContext(context)) return { receipt: { requestId: context.request.id, status: "blocked", replayable: true, ledgerRecorded: false }, operatorSummary: "blocked: missing tenant/project scope" };
  const decision = evaluateRuntimeAuthority(context.request, kernel.authority);
  if (!decision.allow) return { receipt: { requestId: context.request.id, status: "blocked", replayable: true, ledgerRecorded: false }, operatorSummary: `blocked: ${decision.reason}` };
  if (context.request.externalCapability && !context.request.realityBridgePassed) return { receipt: { requestId: context.request.id, status: "blocked", replayable: true, ledgerRecorded: false }, operatorSummary: "blocked: reality bridge required" };
  if (context.request.mutatesState && !context.request.controlledApplyPassed) return { receipt: { requestId: context.request.id, status: "blocked", replayable: true, ledgerRecorded: false }, operatorSummary: "blocked: controlled apply required" };
  if (context.request.mutatesState && !context.request.approvalPackageApproved) return { receipt: { requestId: context.request.id, status: "blocked", replayable: true, ledgerRecorded: false }, operatorSummary: "blocked: approval required" };
  if (!context.request.vaultReferenceUsed) return { receipt: { requestId: context.request.id, status: "blocked", replayable: true, ledgerRecorded: false }, operatorSummary: "blocked: vault reference required" };
  return { receipt: { requestId: context.request.id, status: "completed", replayable: true, ledgerRecorded: true }, operatorSummary: summarizeUnifiedExecutionForOperator(context.request.id, "completed", STAGES) };
};

export const pauseUnifiedExecution = (pipeline: RuntimeExecutionPipeline): RuntimeExecutionPipeline => pipeline;
export const resumeUnifiedExecution = (pipeline: RuntimeExecutionPipeline): RuntimeExecutionPipeline => pipeline;
export const abortUnifiedExecution = (requestId: string): RuntimeExecutionReceipt => ({ requestId, status: "failed", replayable: true, ledgerRecorded: false });
export const freezeUnifiedExecution = (context: RuntimeExecutionContext, lock: RuntimeExecutionLock): RuntimeExecutionContext => ({ ...context, frozen: true, lock });
export const createUnifiedRollbackPlan = (failure: RuntimeExecutionFailure): RuntimeExecutionRollback => ({ requestId: failure.requestId, rollbackPlanId: `rb-${failure.requestId}`, ready: true });
export const replayUnifiedExecution = (plan: RuntimeExecutionPlan): RuntimeExecutionReplay => ({ requestId: plan.requestId, reconstructedStages: [...plan.stages], deterministic: true });
export const recordUnifiedLedgerEntry = (requestId: string, events: string[]): RuntimeExecutionLedgerRecord => ({ requestId, events, appendOnly: true });
export const updateKnowledgeFromExecution = (requestId: string, summary: string): RuntimeExecutionKnowledgeUpdate => ({ requestId, nodeId: `knowledge-${requestId}`, summary });
export const summarizeUnifiedExecutionForOperator = (requestId: string, status: string, completedStages: RuntimeExecutionStage[]): string => `Execution ${requestId} ${status}; stages=${completedStages.length}`;
