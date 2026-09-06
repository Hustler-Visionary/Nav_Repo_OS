export type VerticalSliceStep = {
  name:
    | "Human Goal"
    | "Cognitive Kernel"
    | "Policy Runtime"
    | "Constitutional Runtime"
    | "Evidence-backed Repo Read"
    | "Change Proposal"
    | "Simulation"
    | "Approval Package"
    | "Controlled Apply Mock"
    | "Ledger Record"
    | "Knowledge Graph Update"
    | "Replay"
    | "Executive Summary";
  status: "pending" | "completed" | "blocked";
  details: string;
};

export type VerticalSliceScenario = {
  id: string;
  humanGoal: string;
  steps: VerticalSliceStep[];
  approvalState: "pending" | "approved" | "rejected";
  policyDecision: string;
  constitutionalDecision: string;
  evidenceChain: string[];
  proposalDiff: string;
  applyReceipt: string;
  ledgerEntryId: string;
  knowledgeUpdate: string;
  replayTimeline: string[];
  executiveSummary: string;
};

export type ProductShell = {
  id: string;
  title: string;
  activeScenarioId: string;
};

export type DemoLauncher = {
  availableScenarios: string[];
};

export type SystemCapabilityMap = {
  capability: string;
  backedByDomain: string;
  productionReady: boolean;
};

export type ArchitectureOverview = {
  layers: string[];
  keyFlows: string[];
};

export type InvestorNarrative = {
  headline: string;
  proofPoints: string[];
};

export type OperatorRunbook = {
  startupChecklist: string[];
  failurePlaybook: string[];
};

export type TechnicalRoadmap = {
  nearTerm: string[];
  midTerm: string[];
  longTerm: string[];
};

export type RiskRegister = {
  risks: Array<{ id: string; description: string; mitigation: string }>;
};

export type ProductionGapAnalysis = {
  ready: string[];
  missing: string[];
};
