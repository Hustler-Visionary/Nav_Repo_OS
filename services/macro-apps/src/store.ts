import type { RepoNode, RepoMode } from "@tst-autonomous/repo-knowledge";
import type { TraceEvent } from "@tst-autonomous/kernel";
import type { WorkflowState, ApprovalPackage, EvolutionProposal, RuleCandidate } from "@tst-autonomous/governance-compliance";

export type CanvasView = { zoom: number; panX: number; panY: number; search: string; activeLayer: string };

export interface AppState {
  repoSlice: { nodes: RepoNode[]; selectedNodeId: string | undefined; repoMode: RepoMode; providerName: string };
  graphSlice: { view: CanvasView };
  editorSlice: { activeTab: "code" | "description" };
  agentSlice: { mode: "guided" | "autonomous"; pendingCommandIds: string[] };
  traceSlice: { events: TraceEvent[] };
  governanceSlice: {
    state: WorkflowState;
    approvalPackages: ApprovalPackage[];
    ruleCandidates: RuleCandidate[];
    evolutionProposals: EvolutionProposal[];
    maxRetries: number;
    confidenceThreshold: number;
    allowedScopePrefixes: string[];
  };
  uiValidationSlice: { isValid: boolean; retryCount: number; retryBudget: number; lastDiagnostic: string | undefined };
}

export const createInitialState = (): AppState => ({
  repoSlice: { nodes: [], selectedNodeId: undefined, repoMode: "mock", providerName: "MockRepoProvider" },
  graphSlice: { view: { zoom: 1, panX: 0, panY: 0, search: "", activeLayer: "all" } },
  editorSlice: { activeTab: "code" },
  agentSlice: { mode: "guided", pendingCommandIds: [] },
  traceSlice: { events: [] },
  governanceSlice: {
    state: "DRAFT",
    approvalPackages: [],
    ruleCandidates: [],
    evolutionProposals: [],
    maxRetries: 3,
    confidenceThreshold: 0.6,
    allowedScopePrefixes: ["src/"]
  },
  uiValidationSlice: { isValid: true, retryCount: 0, retryBudget: 3, lastDiagnostic: undefined }
});

export const storeActions = {
  setNodes: (state: AppState, nodes: RepoNode[]): AppState => ({ ...state, repoSlice: { ...state.repoSlice, nodes: [...nodes] } }),
  selectNode: (state: AppState, nodeId: string): AppState => ({ ...state, repoSlice: { ...state.repoSlice, selectedNodeId: nodeId } }),
  setTab: (state: AppState, tab: "code" | "description"): AppState => ({ ...state, editorSlice: { ...state.editorSlice, activeTab: tab } }),
  setSearch: (state: AppState, search: string): AppState => ({ ...state, graphSlice: { view: { ...state.graphSlice.view, search } } }),
  setZoomPan: (state: AppState, zoom: number, panX: number, panY: number): AppState => ({ ...state, graphSlice: { view: { ...state.graphSlice.view, zoom, panX, panY } } }),
  publishTrace: (state: AppState, event: TraceEvent): AppState => ({ ...state, traceSlice: { events: [...state.traceSlice.events, event] } }),
  addApprovalPackage: (state: AppState, approvalPackage: ApprovalPackage): AppState => ({ ...state, governanceSlice: { ...state.governanceSlice, approvalPackages: [...state.governanceSlice.approvalPackages, approvalPackage] } }),
  addRuleCandidate: (state: AppState, ruleCandidate: RuleCandidate): AppState => ({ ...state, governanceSlice: { ...state.governanceSlice, ruleCandidates: [...state.governanceSlice.ruleCandidates, ruleCandidate] } }),
  addEvolutionProposal: (state: AppState, evolutionProposal: EvolutionProposal): AppState => ({ ...state, governanceSlice: { ...state.governanceSlice, evolutionProposals: [...state.governanceSlice.evolutionProposals, evolutionProposal] } }),
  setWorkflowState: (state: AppState, workflowState: WorkflowState): AppState => ({ ...state, governanceSlice: { ...state.governanceSlice, state: workflowState } })
};
