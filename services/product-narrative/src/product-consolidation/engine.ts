import type {
  ArchitectureOverview,
  DemoLauncher,
  InvestorNarrative,
  OperatorRunbook,
  ProductShell,
  ProductionGapAnalysis,
  RiskRegister,
  SystemCapabilityMap,
  TechnicalRoadmap,
  VerticalSliceScenario,
  VerticalSliceStep
} from "./types.js";

const requiredSteps: VerticalSliceStep["name"][] = [
  "Human Goal",
  "Cognitive Kernel",
  "Policy Runtime",
  "Constitutional Runtime",
  "Evidence-backed Repo Read",
  "Change Proposal",
  "Simulation",
  "Approval Package",
  "Controlled Apply Mock",
  "Ledger Record",
  "Knowledge Graph Update",
  "Replay",
  "Executive Summary"
];

export const createVerticalSliceScenario = (id: string, humanGoal: string): VerticalSliceScenario => ({
  id,
  humanGoal,
  steps: requiredSteps.map((name) => ({ name, status: "pending", details: "not executed" })),
  approvalState: "pending",
  policyDecision: "pending",
  constitutionalDecision: "pending",
  evidenceChain: [],
  proposalDiff: "",
  applyReceipt: "",
  ledgerEntryId: "",
  knowledgeUpdate: "",
  replayTimeline: [],
  executiveSummary: ""
});

export const applyVerticalSliceStep = (scenario: VerticalSliceScenario, stepName: VerticalSliceStep["name"], details: string): VerticalSliceScenario => ({
  ...scenario,
  steps: scenario.steps.map((step) => (step.name === stepName ? { ...step, status: "completed", details } : step))
});

export const canApplyFromApproval = (scenario: VerticalSliceScenario): boolean => scenario.approvalState === "approved";

export const recordCriticalEventInLedger = (scenario: VerticalSliceScenario, ledgerEntryId: string): VerticalSliceScenario => ({ ...scenario, ledgerEntryId });

export const updateKnowledgeFromResult = (scenario: VerticalSliceScenario, knowledgeUpdate: string): VerticalSliceScenario => ({ ...scenario, knowledgeUpdate });

export const reconstructReplay = (scenario: VerticalSliceScenario): string[] =>
  scenario.steps.filter((step) => step.status === "completed").map((step) => `${step.name}:${step.details}`);

export const generateExecutiveSummary = (scenario: VerticalSliceScenario): string =>
  `Goal: ${scenario.humanGoal}. Approval: ${scenario.approvalState}. Ledger: ${scenario.ledgerEntryId || "none"}.`;

export const runVerticalSliceDeterministic = (goal: string): VerticalSliceScenario => {
  let s = createVerticalSliceScenario("vertical-1", goal);
  s = applyVerticalSliceStep(s, "Human Goal", goal);
  s = { ...s, policyDecision: "allow with approval", constitutionalDecision: "allow with rollback", evidenceChain: ["ev-1"], proposalDiff: "diff --mock" };
  s = applyVerticalSliceStep(s, "Cognitive Kernel", "decision generated");
  s = applyVerticalSliceStep(s, "Policy Runtime", s.policyDecision);
  s = applyVerticalSliceStep(s, "Constitutional Runtime", s.constitutionalDecision);
  s = applyVerticalSliceStep(s, "Evidence-backed Repo Read", "evidence loaded");
  s = applyVerticalSliceStep(s, "Change Proposal", s.proposalDiff);
  s = applyVerticalSliceStep(s, "Simulation", "simulation passed");
  s = { ...s, approvalState: "approved" };
  s = applyVerticalSliceStep(s, "Approval Package", "approved by human");
  s = applyVerticalSliceStep(s, "Controlled Apply Mock", canApplyFromApproval(s) ? "mock apply executed" : "blocked");
  s = recordCriticalEventInLedger(s, "ledger-1");
  s = applyVerticalSliceStep(s, "Ledger Record", s.ledgerEntryId);
  s = updateKnowledgeFromResult(s, "knowledge updated from apply result");
  s = applyVerticalSliceStep(s, "Knowledge Graph Update", s.knowledgeUpdate);
  s = { ...s, replayTimeline: reconstructReplay(s) };
  s = applyVerticalSliceStep(s, "Replay", "timeline reconstructed");
  s = { ...s, executiveSummary: generateExecutiveSummary(s) };
  s = applyVerticalSliceStep(s, "Executive Summary", s.executiveSummary);
  return s;
};

export const createProductShell = (activeScenarioId: string): ProductShell => ({ id: "product-shell", title: "TST Autonomous", activeScenarioId });
export const createDemoLauncher = (scenarioIds: string[]): DemoLauncher => ({ availableScenarios: scenarioIds });

export const defaultCapabilityMap = (): SystemCapabilityMap[] => [
  { capability: "Governed policy evaluation", backedByDomain: "policy-runtime", productionReady: false },
  { capability: "Constitutional enforcement", backedByDomain: "constitutional-runtime", productionReady: false },
  { capability: "Evidence-backed repo read", backedByDomain: "repo/evidence", productionReady: false }
];

export const defaultArchitectureOverview = (): ArchitectureOverview => ({
  layers: ["UI", "Product Consolidation", "Governance Domains", "Persistence Domains"],
  keyFlows: ["Human Goal -> Governed Apply", "Event -> Ledger -> Replay"]
});

export const defaultInvestorNarrative = (): InvestorNarrative => ({
  headline: "Governed autonomous software factory with sovereign controls",
  proofPoints: ["Constitutional override", "Policy deny-by-default", "Replayable ledgered flows"]
});

export const defaultOperatorRunbook = (): OperatorRunbook => ({
  startupChecklist: ["Load scenario", "Verify approvals", "Validate replay"],
  failurePlaybook: ["Trigger freeze", "Recover snapshot", "Re-run replay"]
});

export const defaultTechnicalRoadmap = (): TechnicalRoadmap => ({
  nearTerm: ["Integrate UI with domain engines"],
  midTerm: ["Durable infra adapters"],
  longTerm: ["Production-grade distributed runtime"]
});

export const defaultRiskRegister = (): RiskRegister => ({
  risks: [{ id: "R1", description: "Mock-only apply flow", mitigation: "Controlled real adapters with approvals" }]
});

export const defaultProductionGapAnalysis = (): ProductionGapAnalysis => ({
  ready: ["Deterministic policy evaluation", "Constitutional invariants"],
  missing: ["Real infra orchestration", "External persistence hardening"]
});
