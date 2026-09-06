export type OperatorWorkspace = {
  id: string;
  operatorId: string;
  activeView: OperatorViewType;
  progressiveDisclosureLevel: "minimal" | "standard" | "deep";
};

export type OperatorViewType =
  | "Executive View"
  | "Operator View"
  | "Governance View"
  | "Incident View"
  | "Replay View"
  | "Engineering View"
  | "Investor View";

export type OperationalSession = {
  id: string;
  workspaceId: string;
  environment: EnvironmentStatus;
  startedAt: string;
};

export type WorkflowPreset = {
  id: string;
  name: string;
  steps: string[];
};

export type IncidentConsole = {
  open: boolean;
  activeIncidentId?: string;
  recoveryGuide: string;
};

export type LiveGovernanceMonitor = {
  active: boolean;
  violations: string[];
};

export type ReplayNavigator = {
  timeline: string[];
  cursor: number;
};

export type CognitiveDecisionView = {
  summary: string;
  why: string;
};

export type TraceExplorer = {
  visibleTraces: string[];
  hiddenTraceCount: number;
};

export type ConstitutionalAlert = {
  severity: "low" | "medium" | "high" | "critical";
  message: string;
};

export type OperationalNotification = {
  id: string;
  type: "info" | "warning" | "critical";
  message: string;
};

export type RuntimeHealthIndicator = {
  runtimePressure: number;
  memoryPressure: number;
  queuePressure: number;
  driftScore: number;
  escalationScore: number;
};

export type SystemHealthOverview = {
  score: number;
  status: "healthy" | "warning" | "critical";
  indicator: RuntimeHealthIndicator;
};

export type ProductionReadinessBoard = {
  mockOnlySubsystems: string[];
  simulationBoundaries: string[];
  infraGaps: string[];
  productionBlockers: string[];
  scalabilityBottlenecks: string[];
  trustGaps: string[];
};

export type GuidedExecutionFlow = {
  title: string;
  steps: string[];
  explainabilityMode: boolean;
};

export type OperatorAction = {
  id: string;
  label: string;
  allowed: boolean;
};

export type OperatorPermissionProfile = {
  operatorId: string;
  role: "viewer" | "operator" | "admin";
  allowedViews: OperatorViewType[];
};

export type OperationalPlaybook = {
  id: string;
  title: string;
  procedures: string[];
};

export type EnvironmentStatus = "local" | "preview" | "staging" | "production";
