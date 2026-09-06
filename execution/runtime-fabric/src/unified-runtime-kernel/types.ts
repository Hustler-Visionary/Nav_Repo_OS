export type RuntimeExecutionStage =
  | "human_goal_received"
  | "cognitive_interpretation"
  | "policy_evaluation"
  | "constitutional_evaluation"
  | "mcp_capability_resolution"
  | "reality_boundary_validation"
  | "sandbox_preparation"
  | "execution_preview"
  | "approval_package_generation"
  | "approval_verification"
  | "controlled_execution"
  | "verification"
  | "rollback_readiness_check"
  | "ledger_recording"
  | "knowledge_graph_update"
  | "replay_materialization"
  | "operator_summary";

export type RuntimeExecutionRequest = {
  id: string;
  humanGoal: string;
  tenantId: string;
  projectId: string;
  externalCapability: boolean;
  mutatesState: boolean;
  approvalPackageApproved: boolean;
  policyDecisionPassed: boolean;
  constitutionalDecisionPassed: boolean;
  realityBridgePassed: boolean;
  controlledApplyPassed: boolean;
  vaultReferenceUsed: boolean;
};

export type RuntimeExecutionPlan = { requestId: string; stages: RuntimeExecutionStage[] };
export type RuntimeExecutionContext = { request: RuntimeExecutionRequest; plan: RuntimeExecutionPlan; frozen: boolean; lock?: RuntimeExecutionLock };
export type RuntimeExecutionDecision = { allow: boolean; reason: string };
export type RuntimeExecutionPipeline = { id: string; completedStages: RuntimeExecutionStage[]; failedStage?: RuntimeExecutionStage };
export type RuntimeExecutionReceipt = { requestId: string; status: "completed" | "blocked" | "failed" | "frozen"; replayable: boolean; ledgerRecorded: boolean };
export type RuntimeExecutionResult = { receipt: RuntimeExecutionReceipt; operatorSummary: string };
export type RuntimeExecutionFailure = { requestId: string; stage: RuntimeExecutionStage; reason: string };
export type RuntimeExecutionRollback = { requestId: string; rollbackPlanId: string; ready: boolean };
export type RuntimeExecutionReplay = { requestId: string; reconstructedStages: RuntimeExecutionStage[]; deterministic: boolean };
export type RuntimeExecutionBoundary = { tenantProjectRequired: boolean; externalThroughMCPRequired: boolean; secretByReferenceOnly: boolean };
export type RuntimeExecutionAuthority = { policyRequired: boolean; constitutionalRequired: boolean; denyByDefault: boolean };
export type RuntimeExecutionLock = { id: string; reason: string };
export type RuntimeExecutionPermit = { requestId: string; granted: boolean; reason: string };
export type RuntimeExecutionTrace = { requestId: string; criticalEvents: string[] };
export type RuntimeExecutionLedgerRecord = { requestId: string; events: string[]; appendOnly: true };
export type RuntimeExecutionKnowledgeUpdate = { requestId: string; nodeId: string; summary: string };
export type UnifiedRuntimeKernel = { id: string; boundary: RuntimeExecutionBoundary; authority: RuntimeExecutionAuthority; pipelineTemplate: RuntimeExecutionStage[] };
