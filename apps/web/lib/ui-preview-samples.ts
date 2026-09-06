import { calculateDemoKpis } from "@tst-autonomous/product-narrative";
import { createInitialState, storeActions, type AppState } from "@tst-autonomous/macro-apps";
import { createExecutionGraph } from "@tst-autonomous/graph-orchestration";
import type { ExecutionNode } from "@tst-autonomous/graph-orchestration";
import { createWorkflow, advancePhase } from "@tst-autonomous/product-narrative";
import { createOrganizationGraph } from "@tst-autonomous/product-narrative";
import { calculateStrategicKpis, generateEnterpriseHeatmaps } from "@tst-autonomous/product-narrative";
import { createCinematicTimeline } from "@tst-autonomous/product-narrative";
import { generateNarrative } from "@tst-autonomous/product-narrative";
import { runVerticalSliceDeterministic, createProductShell } from "@tst-autonomous/product-narrative";
import type { RuleCandidate, EvolutionProposal } from "@tst-autonomous/governance-compliance";
import type { ChangePreview, RepoNode } from "@tst-autonomous/repo-knowledge";

const sampleExecutionNodes: ExecutionNode[] = [
  {
    id: "node-repo-1",
    type: "repo",
    ownerAgent: "agent-alpha",
    subteam: "platform",
    state: "EXECUTING",
    risk: "medium",
    confidence: 0.82,
    cost: "medium",
    retries: 0,
    dependencies: [],
    blockers: [],
    traceRefs: ["trace-1"],
    approvalRequired: false,
    verificationRequired: true
  },
  {
    id: "node-approval-1",
    type: "approval",
    ownerAgent: "agent-beta",
    subteam: "governance",
    state: "WAITING_APPROVAL",
    risk: "high",
    confidence: 0.61,
    cost: "low",
    retries: 1,
    dependencies: ["node-repo-1"],
    blockers: [],
    traceRefs: ["trace-2"],
    approvalRequired: true,
    verificationRequired: false
  },
  {
    id: "node-verify-1",
    type: "verification",
    ownerAgent: "agent-gamma",
    subteam: "qa",
    state: "BLOCKED",
    risk: "high",
    confidence: 0.4,
    cost: "high",
    retries: 3,
    dependencies: ["node-approval-1"],
    blockers: ["semantic firewall"],
    traceRefs: ["trace-3"],
    approvalRequired: false,
    verificationRequired: true
  }
];

const sampleRuleCandidates: RuleCandidate[] = [
  { id: "rule-1", scope: "node", nodeId: "node-repo-1", summary: "Require verification before mock apply on high-risk nodes", createdFrom: "loop-signature-14", status: "governance_review" },
  { id: "rule-2", scope: "global", summary: "Cap retries at 3 before escalation", createdFrom: "retry-overflow-9", status: "draft" }
];

const sampleEvolutionProposals: EvolutionProposal[] = [
  {
    id: "evo-1",
    sourceFailureId: "fail-42",
    ruleCandidateId: "rule-1",
    summary: "Tighten approval gate for repo-write commands",
    proposedChange: "Add mandatory verification step before ledger record",
    affectedModules: ["graph-orchestration", "governance"],
    risk: "medium",
    status: "governance_review",
    traceEvents: ["evolution_proposed"]
  }
];

const sampleChangePreview: ChangePreview = {
  commandId: "cmd-42",
  affectedFiles: ["services/macro-apps/src/store.ts"],
  beforeAfterConceptual: ["before: mock read path", "after: governed real read path"],
  risk: "medium",
  cost: "low",
  confidence: 0.8,
  expectedTraces: ["repo_change_apply_requested", "repo_change_applied"],
  rollbackPlan: "revert mock patch"
};

const sampleRepoNode: RepoNode = {
  id: "services/governance-compliance/src/governance/state-machine.ts",
  path: "services/governance-compliance/src/governance/state-machine.ts",
  name: "state-machine.ts",
  artifactType: "module",
  language: "typescript",
  layer: "governance",
  status: "implemented",
  risk: "medium",
  confidence: 0.88,
  cost: "low",
  codePreview: "export const allowedTransitions = ...",
  description: "Governs valid workflow state transitions for the autonomous execution lifecycle.",
  dependencies: ["services/governance-compliance/src/governance/types.ts"],
  responsibilities: ["Enforce valid state transitions", "Reject unsafe jumps"],
  architectureNotes: ["Pure function, no side effects", "Single source of truth for workflow states"],
  traceEvents: [],
  validations: [{ id: "v1", name: "transition-table-complete", passed: true, notes: "all states covered" }],
  changelog: [{ id: "c1", at: new Date().toISOString(), author: "system", summary: "initial implementation" }]
};

let appState: AppState = createInitialState();
appState = storeActions.setWorkflowState(appState, "IMPLEMENTATION_ALLOWED");
appState = storeActions.publishTrace(appState, {
  id: "trace-1",
  type: "repo_file_read",
  timestamp: new Date().toISOString(),
  actor: "system",
  details: "sample read"
});

export type UiPreviewSample = { kind: string; data: unknown };

/** Every presentation/* path (one per package) this app can build a real preview sample for. */
export const UI_PREVIEW_PATHS = [
  "execution/graph-orchestration/src/presentation/hud/OperationalHUD.ts",
  "services/repo-knowledge/src/presentation/canvas/RepoCanvas.tsx",
  "services/repo-knowledge/src/presentation/editor/NodeEditor.tsx",
  "execution/graph-orchestration/src/presentation/node/GovernanceOverlay.ts",
  "services/product-narrative/src/presentation/strategic/ExecutiveCommandCenter.ts",
  "services/product-narrative/src/presentation/strategic/StrategicOperationsCenter.ts",
  "services/product-narrative/src/presentation/executive/ExecutiveOperationsPanel.ts",
  "services/product-narrative/src/presentation/investor/InvestorDemoMode.ts",
  "services/repo-knowledge/src/presentation/inspector/DiffPreviewPanel.ts",
  "execution/graph-orchestration/src/presentation/loop-prevention/LoopDiagnosticPanel.ts",
  "services/governance-compliance/src/presentation/evolution/EvolutionSurface.ts",
  "services/product-narrative/src/presentation/reasoning/ReasoningInspectorPanel.ts",
  "services/product-narrative/src/presentation/replay/ReplayTheater.ts",
  "services/product-narrative/src/presentation/product/ProductShell.tsx",
  "services/product-narrative/src/presentation/demo/ExecutiveDemoMode.ts"
] as const;

/** Maps a presentation/* file path to real sample data built from actual package factories -- not hand-authored fixtures where a real one exists. */
export const buildUiPreviewSample = (relPath: string): UiPreviewSample | null => {
  switch (relPath) {
    case "services/product-narrative/src/presentation/demo/ExecutiveDemoMode.ts":
      return { kind: "demo-kpis", data: calculateDemoKpis(1) };

    case "services/governance-compliance/src/presentation/evolution/EvolutionSurface.ts":
      return { kind: "evolution-surface", data: { rules: sampleRuleCandidates, proposals: sampleEvolutionProposals } };

    case "services/product-narrative/src/presentation/executive/ExecutiveOperationsPanel.ts": {
      const w1 = advancePhase(createWorkflow("wf-1", "Ship autonomous vertical slice", "Wire real domain execution"), "p1");
      const w2 = createWorkflow("wf-2", "Harden governance gates", "Add semantic firewall");
      return { kind: "executive-operations", data: { workflows: [w1, w2] } };
    }

    case "execution/graph-orchestration/src/presentation/hud/OperationalHUD.ts": {
      const graph = createExecutionGraph("sess-1", sampleExecutionNodes);
      return { kind: "operational-hud", data: { state: appState, graph, throughputPerSec: 14.2 } };
    }

    case "services/repo-knowledge/src/presentation/inspector/DiffPreviewPanel.ts":
      return { kind: "diff-preview", data: sampleChangePreview };

    case "services/product-narrative/src/presentation/investor/InvestorDemoMode.ts": {
      const graph = createOrganizationGraph("org-graph-1");
      return { kind: "investor-demo", data: { graph, kpis: calculateStrategicKpis(graph) } };
    }

    case "execution/graph-orchestration/src/presentation/loop-prevention/LoopDiagnosticPanel.ts":
      return { kind: "loop-diagnostic", data: { nodes: sampleExecutionNodes } };

    case "execution/graph-orchestration/src/presentation/node/GovernanceOverlay.ts":
      return { kind: "governance-overlay", data: sampleExecutionNodes[2] };

    case "services/product-narrative/src/presentation/reasoning/ReasoningInspectorPanel.ts":
      return {
        kind: "reasoning-inspector",
        data: {
          narratives: [
            generateNarrative("execution", "route-selected", 0.82),
            generateNarrative("governance", "approval-required", 0.55),
            generateNarrative("recovery", "retry-after-block", 0.71)
          ]
        }
      };

    case "services/product-narrative/src/presentation/replay/ReplayTheater.ts":
      return { kind: "replay-theater", data: { timeline: createCinematicTimeline("timeline-1", "story-1", "scene-1", 1), speed: 1.5, focus: "escalation" } };

    case "services/product-narrative/src/presentation/strategic/StrategicOperationsCenter.ts": {
      const graph = createOrganizationGraph("org-graph-2");
      return { kind: "strategic-operations", data: { graph, kpis: calculateStrategicKpis(graph) } };
    }

    case "services/product-narrative/src/presentation/strategic/ExecutiveCommandCenter.ts": {
      const graph = createOrganizationGraph("org-graph-3");
      return { kind: "executive-command-center", data: { graph, kpis: calculateStrategicKpis(graph), heatmaps: generateEnterpriseHeatmaps(graph) } };
    }

    case "services/repo-knowledge/src/presentation/canvas/RepoCanvas.tsx":
      return { kind: "repo-canvas", data: { nodes: [sampleRepoNode], selectedNodeId: sampleRepoNode.id, zoom: 1.2, panX: 0, panY: 0, search: "" } };

    case "services/repo-knowledge/src/presentation/editor/NodeEditor.tsx":
      return { kind: "node-editor", data: { node: sampleRepoNode, tab: "code" } };

    case "services/product-narrative/src/presentation/product/ProductShell.tsx": {
      const scenario = runVerticalSliceDeterministic("Ship the REPO_OS product shell");
      return { kind: "product-shell", data: { shell: createProductShell(scenario.id), scenario } };
    }

    default:
      return null;
  }
};
