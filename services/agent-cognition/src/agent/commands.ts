import type { AppState } from "@tst-autonomous/macro-apps";
import { storeActions, validateCanvasUI } from "@tst-autonomous/macro-apps";
import type { RepoNode } from "@tst-autonomous/repo-knowledge";
import { canTransition, type WorkflowState, type ApprovalLevel, type ApprovalPackage, type EvolutionProposal, type RuleCandidate } from "@tst-autonomous/governance-compliance";
import type { TraceEvent, TraceEventType } from "@tst-autonomous/kernel";

export interface AgentCommand<TPayload> {
  id: string;
  label: string;
  payload: TPayload;
  validate: (state: AppState) => { ok: boolean; reason?: string };
  preview: () => string;
  expectedTraceEvents: () => TraceEventType[];
  semanticFirewallCheck: (state: AppState) => { ok: boolean; reason?: string };
  validationGateCheck: (state: AppState) => { ok: boolean; reason?: string };
  requiredApprovalLevel: ApprovalLevel;
  apply: (state: AppState) => AppState;
  rollbackPlan: () => string;
}

const mkTrace = (type: TraceEventType, details: string, nodeId?: string): TraceEvent => ({ id: `${type}-${Date.now()}`, type, timestamp: new Date().toISOString(), actor: "agent", details, ...(nodeId ? { nodeId } : {}) });

const blockedScopes = ["policy", "schema", "agent"] as const;

const mustApprove = (state: AppState, commandId: string): boolean => state.governanceSlice.approvalPackages.some((p) => p.commandId === commandId && p.humanDecision === "approved");

export type CreateNodePayload = { node: RepoNode; confidence: number; affectedFiles: string[] };
export type UpdateNodeDescriptionPayload = { nodeId: string; description: string; confidence: number; affectedFiles: string[] };
export type AddDependencyPayload = { nodeId: string; dependencyId: string; confidence: number; affectedFiles: string[] };
export type GeneratePreviewPayload = { nodeId: string };
export type CreateRuleCandidatePayload = { summary: string; createdFrom: string; scope: "node" | "global"; nodeId?: string };
export type CreateEvolutionProposalPayload = { sourceFailureId: string; ruleCandidateId: string; summary: string; proposedChange: string; affectedModules: string[]; risk: "low" | "medium" | "high" };
export type ApplyApprovedChangePayload = { commandId: string; toState: WorkflowState; confidence: number; affectedFiles: string[] };

export const createApprovalPackage = (command: AgentCommand<unknown>, state: AppState, interpretedIntent: string, technicalPlan: string, affectedNodes: string[], affectedFiles: string[]): ApprovalPackage => ({
  id: `ap-${command.id}`,
  commandId: command.id,
  interpretedIntent,
  technicalPlan,
  affectedNodes,
  affectedFiles,
  risk: "medium",
  cost: "medium",
  confidence: 0.8,
  expectedTraceEvents: command.expectedTraceEvents(),
  expectedValidations: ["semantic_firewall", "validation_gate"],
  rollbackPlan: command.rollbackPlan(),
  humanDecision: "pending"
});

const firewallCommon = (state: AppState, confidence: number, affectedFiles: string[]): { ok: boolean; reason?: string } => {
  if (confidence < state.governanceSlice.confidenceThreshold) return { ok: false, reason: "confidence below threshold" };
  if (state.uiValidationSlice.retryCount > state.governanceSlice.maxRetries) return { ok: false, reason: "retry infinito detectado" };
  if (!affectedFiles.every((file) => state.governanceSlice.allowedScopePrefixes.some((prefix) => file.startsWith(prefix)))) return { ok: false, reason: "scope creep" };
  return { ok: true };
};

export const applyCommandWithGovernance = <T>(state: AppState, command: AgentCommand<T>): AppState => {
  const semantic = command.semanticFirewallCheck(state);
  if (!semantic.ok) return storeActions.addRuleCandidate(storeActions.publishTrace(state, mkTrace("semantic_firewall_blocked", semantic.reason ?? "blocked")), { id: `rc-${command.id}`, scope: "global", summary: semantic.reason ?? "blocked", createdFrom: command.id, status: "draft" });
  const gate = command.validationGateCheck(state);
  if (!gate.ok) return storeActions.addRuleCandidate(storeActions.publishTrace(state, mkTrace("validation_gate_failed", gate.reason ?? "validation failed")), { id: `rc-${command.id}`, scope: "global", summary: gate.reason ?? "validation failed", createdFrom: command.id, status: "draft" });
  const valid = command.validate(state);
  if (!valid.ok) return storeActions.addRuleCandidate(storeActions.publishTrace(state, mkTrace("validation_gate_failed", valid.reason ?? "command invalid")), { id: `rc-${command.id}`, scope: "global", summary: valid.reason ?? "command invalid", createdFrom: command.id, status: "draft" });
  const withTrace = storeActions.publishTrace(state, mkTrace("validation_gate_passed", `${command.id} approved to apply`));
  return command.apply(withTrace);
};

export const commandFactory = {
  createNode: (payload: CreateNodePayload): AgentCommand<CreateNodePayload> => ({
    id: `createNode-${payload.node.id}`,
    label: "createNode", payload,
    validate: (state) => ({ ok: !state.repoSlice.nodes.some((n) => n.id === payload.node.id), reason: "node already exists" }),
    preview: () => `Create node ${payload.node.path}`,
    expectedTraceEvents: () => ["file_node_created"],
    semanticFirewallCheck: (state) => firewallCommon(state, payload.confidence, payload.affectedFiles),
    validationGateCheck: (state) => ({ ok: mustApprove(state, `createNode-${payload.node.id}`), reason: "approval package required" }),
    requiredApprovalLevel: "human_gate",
    apply: (state) => storeActions.publishTrace(storeActions.setNodes(state, [...state.repoSlice.nodes, payload.node]), mkTrace("file_node_created", `node created ${payload.node.id}`, payload.node.id)),
    rollbackPlan: () => "Remove created node"
  }),
  updateNodeDescription: (payload: UpdateNodeDescriptionPayload): AgentCommand<UpdateNodeDescriptionPayload> => ({
    id: `updateNodeDescription-${payload.nodeId}`,
    label: "updateNodeDescription", payload,
    validate: (state) => ({ ok: state.repoSlice.nodes.some((n) => n.id === payload.nodeId), reason: "node does not exist" }),
    preview: () => `Update description for ${payload.nodeId}`,
    expectedTraceEvents: () => ["code_stream_completed"],
    semanticFirewallCheck: (state) => {
      const node = state.repoSlice.nodes.find((n) => n.id === payload.nodeId);
      if (node && blockedScopes.includes(node.artifactType as (typeof blockedScopes)[number])) return { ok: false, reason: "forbidden artifact mutation" };
      return firewallCommon(state, payload.confidence, payload.affectedFiles);
    },
    validationGateCheck: (state) => ({ ok: mustApprove(state, `updateNodeDescription-${payload.nodeId}`), reason: "approval package required" }),
    requiredApprovalLevel: "human_gate",
    apply: (state) => {
      const nodes = state.repoSlice.nodes.map((n) => n.id === payload.nodeId ? { ...n, description: payload.description } : n);
      return storeActions.publishTrace(storeActions.setNodes(state, nodes), mkTrace("code_stream_completed", `description updated ${payload.nodeId}`, payload.nodeId));
    },
    rollbackPlan: () => "Revert node description"
  }),
  addDependency: (payload: AddDependencyPayload): AgentCommand<AddDependencyPayload> => ({
    id: `addDependency-${payload.nodeId}-${payload.dependencyId}`,
    label: "addDependency", payload,
    validate: (state) => ({ ok: state.repoSlice.nodes.some((n) => n.id === payload.dependencyId), reason: "dependencia inexistente" }),
    preview: () => `Add dependency ${payload.dependencyId} to ${payload.nodeId}`,
    expectedTraceEvents: () => ["dependency_navigated"],
    semanticFirewallCheck: (state) => firewallCommon(state, payload.confidence, payload.affectedFiles),
    validationGateCheck: (state) => ({ ok: mustApprove(state, `addDependency-${payload.nodeId}-${payload.dependencyId}`), reason: "approval package required" }),
    requiredApprovalLevel: "human_gate",
    apply: (state) => {
      const nodes = state.repoSlice.nodes.map((n) => n.id === payload.nodeId ? { ...n, dependencies: [...n.dependencies, payload.dependencyId] } : n);
      return storeActions.publishTrace(storeActions.setNodes(state, nodes), mkTrace("dependency_navigated", `${payload.nodeId}->${payload.dependencyId}`, payload.nodeId));
    },
    rollbackPlan: () => "Remove appended dependency"
  }),
  generatePreview: (payload: GeneratePreviewPayload): AgentCommand<GeneratePreviewPayload> => ({
    id: `generatePreview-${payload.nodeId}`, label: "generatePreview", payload,
    validate: (state) => ({ ok: state.repoSlice.nodes.some((n) => n.id === payload.nodeId), reason: "node missing" }),
    preview: () => `Generate preview for ${payload.nodeId}`,
    expectedTraceEvents: () => ["demo_rendered"],
    semanticFirewallCheck: () => ({ ok: true }),
    validationGateCheck: () => ({ ok: true }),
    requiredApprovalLevel: "none",
    apply: (state) => storeActions.publishTrace(state, mkTrace("demo_rendered", `preview generated`, payload.nodeId)),
    rollbackPlan: () => "No-op"
  }),
  validateUI: (): AgentCommand<Record<string, never>> => ({
    id: "validateUI", label: "validateUI", payload: {},
    validate: () => ({ ok: true }), preview: () => "Run UI validation", expectedTraceEvents: () => ["ui_validation_started", "ui_validation_passed"], semanticFirewallCheck: () => ({ ok: true }), validationGateCheck: () => ({ ok: true }), requiredApprovalLevel: "none",
    apply: (state) => validateCanvasUI(state).state, rollbackPlan: () => "No-op"
  }),
  createRuleCandidate: (payload: CreateRuleCandidatePayload): AgentCommand<CreateRuleCandidatePayload> => ({
    id: `createRuleCandidate-${Date.now()}`, label: "createRuleCandidate", payload,
    validate: () => ({ ok: payload.summary.length > 2, reason: "summary too short" }), preview: () => payload.summary, expectedTraceEvents: () => ["validation_gate_passed"], semanticFirewallCheck: () => ({ ok: true }), validationGateCheck: () => ({ ok: true }), requiredApprovalLevel: "none",
    apply: (state) => storeActions.addRuleCandidate(state, { id: `rc-${Date.now()}`, scope: payload.scope, ...(payload.nodeId ? { nodeId: payload.nodeId } : {}), summary: payload.summary, createdFrom: payload.createdFrom, status: "draft" }),
    rollbackPlan: () => "Delete created rule candidate"
  }),
  createEvolutionProposal: (payload: CreateEvolutionProposalPayload): AgentCommand<CreateEvolutionProposalPayload> => ({
    id: `createEvolutionProposal-${Date.now()}`, label: "createEvolutionProposal", payload,
    validate: (state) => ({ ok: state.governanceSlice.ruleCandidates.some((r) => r.id === payload.ruleCandidateId), reason: "rule candidate missing" }),
    preview: () => payload.summary, expectedTraceEvents: () => ["evolution_proposal_created"], semanticFirewallCheck: () => ({ ok: true }), validationGateCheck: () => ({ ok: true }), requiredApprovalLevel: "governance_review",
    apply: (state) => {
      const proposal: EvolutionProposal = { id: `ep-${Date.now()}`, sourceFailureId: payload.sourceFailureId, ruleCandidateId: payload.ruleCandidateId, summary: payload.summary, proposedChange: payload.proposedChange, affectedModules: payload.affectedModules, risk: payload.risk, status: "draft", traceEvents: [] };
      return storeActions.addEvolutionProposal(storeActions.publishTrace(state, mkTrace("evolution_proposal_created", payload.summary)), proposal);
    },
    rollbackPlan: () => "Delete proposal"
  }),
  applyApprovedChange: (payload: ApplyApprovedChangePayload): AgentCommand<ApplyApprovedChangePayload> => ({
    id: `applyApprovedChange-${payload.commandId}`,
    label: "applyApprovedChange", payload,
    validate: (state) => ({ ok: canTransition(state.governanceSlice.state, payload.toState), reason: "invalid transition" }),
    preview: () => `Promote state to ${payload.toState}`,
    expectedTraceEvents: () => ["markov_decision_selected", "l8_route_selected"],
    semanticFirewallCheck: (state) => firewallCommon(state, payload.confidence, payload.affectedFiles),
    validationGateCheck: (state) => ({ ok: mustApprove(state, `applyApprovedChange-${payload.commandId}`), reason: "approval package required" }),
    requiredApprovalLevel: "governance_review",
    apply: (state) => storeActions.publishTrace(storeActions.setWorkflowState(state, payload.toState), mkTrace("l8_route_selected", `state promoted to ${payload.toState}`)),
    rollbackPlan: () => "Revert workflow state"
  })
};
