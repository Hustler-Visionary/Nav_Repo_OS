import { calculateDemoKpis } from "../../src/components/demo/ExecutiveDemoMode.js";
import { createInitialState, storeActions, type AppState } from "../../src/app/store.js";
import { createExecutionGraph } from "../../src/domain/graph-orchestration/engine.js";
import type { ExecutionNode } from "../../src/domain/graph-orchestration/types.js";
import { createWorkflow, advancePhase } from "../../src/domain/product-workflows/engine.js";
import { createOrganizationGraph } from "../../src/domain/civilization/model.js";
import { calculateStrategicKpis, generateEnterpriseHeatmaps } from "../../src/domain/civilization/intelligence.js";
import { createCinematicTimeline } from "../../src/domain/cinematics/engine.js";
import { generateNarrative } from "../../src/domain/storytelling/narrative.js";
import { runVerticalSliceDeterministic, createProductShell } from "../../src/domain/product-consolidation/engine.js";
import type { RuleCandidate, EvolutionProposal } from "../../src/domain/governance/types.js";
import type { ChangePreview } from "../../src/domain/repo/provider.js";
import type { RepoNode } from "../../src/domain/repo/types.js";

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
  affectedFiles: ["src/app/store.ts"],
  beforeAfterConceptual: ["before: mock read path", "after: governed real read path"],
  risk: "medium",
  cost: "low",
  confidence: 0.8,
  expectedTraces: ["repo_change_apply_requested", "repo_change_applied"],
  rollbackPlan: "revert mock patch"
};

const sampleRepoNode: RepoNode = {
  id: "src/domain/governance/state-machine.ts",
  path: "src/domain/governance/state-machine.ts",
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
  dependencies: ["src/domain/governance/types.ts"],
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

/** Every src/components/* path this app can build a real preview sample for. */
export const UI_PREVIEW_PATHS = [
  "src/components/hud/OperationalHUD.ts",
  "src/components/canvas/RepoCanvas.tsx",
  "src/components/editor/NodeEditor.tsx",
  "src/components/node/GovernanceOverlay.ts",
  "src/components/strategic/ExecutiveCommandCenter.ts",
  "src/components/strategic/StrategicOperationsCenter.ts",
  "src/components/executive/ExecutiveOperationsPanel.ts",
  "src/components/investor/InvestorDemoMode.ts",
  "src/components/inspector/DiffPreviewPanel.ts",
  "src/components/loop-prevention/LoopDiagnosticPanel.ts",
  "src/components/evolution/EvolutionSurface.ts",
  "src/components/reasoning/ReasoningInspectorPanel.ts",
  "src/components/replay/ReplayTheater.ts",
  "src/components/product/ProductShell.tsx",
  "src/components/demo/ExecutiveDemoMode.ts"
] as const;

/** Maps a src/components/* file path to real sample data built from actual src/domain factories -- not hand-authored fixtures where a real one exists. */
export const buildUiPreviewSample = (relPath: string): UiPreviewSample | null => {
  switch (relPath) {
    case "src/components/demo/ExecutiveDemoMode.ts":
      return { kind: "demo-kpis", data: calculateDemoKpis(1) };

    case "src/components/evolution/EvolutionSurface.ts":
      return { kind: "evolution-surface", data: { rules: sampleRuleCandidates, proposals: sampleEvolutionProposals } };

    case "src/components/executive/ExecutiveOperationsPanel.ts": {
      const w1 = advancePhase(createWorkflow("wf-1", "Ship autonomous vertical slice", "Wire real domain execution"), "p1");
      const w2 = createWorkflow("wf-2", "Harden governance gates", "Add semantic firewall");
      return { kind: "executive-operations", data: { workflows: [w1, w2] } };
    }

    case "src/components/hud/OperationalHUD.ts": {
      const graph = createExecutionGraph("sess-1", sampleExecutionNodes);
      return { kind: "operational-hud", data: { state: appState, graph, throughputPerSec: 14.2 } };
    }

    case "src/components/inspector/DiffPreviewPanel.ts":
      return { kind: "diff-preview", data: sampleChangePreview };

    case "src/components/investor/InvestorDemoMode.ts": {
      const graph = createOrganizationGraph("org-graph-1");
      return { kind: "investor-demo", data: { graph, kpis: calculateStrategicKpis(graph) } };
    }

    case "src/components/loop-prevention/LoopDiagnosticPanel.ts":
      return { kind: "loop-diagnostic", data: { nodes: sampleExecutionNodes } };

    case "src/components/node/GovernanceOverlay.ts":
      return { kind: "governance-overlay", data: sampleExecutionNodes[2] };

    case "src/components/reasoning/ReasoningInspectorPanel.ts":
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

    case "src/components/replay/ReplayTheater.ts":
      return { kind: "replay-theater", data: { timeline: createCinematicTimeline("timeline-1", "story-1", "scene-1", 1), speed: 1.5, focus: "escalation" } };

    case "src/components/strategic/StrategicOperationsCenter.ts": {
      const graph = createOrganizationGraph("org-graph-2");
      return { kind: "strategic-operations", data: { graph, kpis: calculateStrategicKpis(graph) } };
    }

    case "src/components/strategic/ExecutiveCommandCenter.ts": {
      const graph = createOrganizationGraph("org-graph-3");
      return { kind: "executive-command-center", data: { graph, kpis: calculateStrategicKpis(graph), heatmaps: generateEnterpriseHeatmaps(graph) } };
    }

    case "src/components/canvas/RepoCanvas.tsx":
      return { kind: "repo-canvas", data: { nodes: [sampleRepoNode], selectedNodeId: sampleRepoNode.id, zoom: 1.2, panX: 0, panY: 0, search: "" } };

    case "src/components/editor/NodeEditor.tsx":
      return { kind: "node-editor", data: { node: sampleRepoNode, tab: "code" } };

    case "src/components/product/ProductShell.tsx": {
      const scenario = runVerticalSliceDeterministic("Ship the REPO_OS product shell");
      return { kind: "product-shell", data: { shell: createProductShell(scenario.id), scenario } };
    }

    default:
      return null;
  }
};
