import type {
  CognitiveDecisionView,
  ConstitutionalAlert,
  EnvironmentStatus,
  GuidedExecutionFlow,
  IncidentConsole,
  LiveGovernanceMonitor,
  OperationalPlaybook,
  OperationalSession,
  OperatorPermissionProfile,
  OperatorViewType,
  OperatorWorkspace,
  ProductionReadinessBoard,
  ReplayNavigator,
  RuntimeHealthIndicator,
  SystemHealthOverview,
  TraceExplorer,
  WorkflowPreset
} from "./types.js";

export const createOperatorWorkspace = (operatorId: string, view: OperatorViewType): OperatorWorkspace => ({
  id: `ws-${operatorId}`,
  operatorId,
  activeView: view,
  progressiveDisclosureLevel: "standard"
});

export const loadOperationalSession = (workspaceId: string, environment: EnvironmentStatus, startedAt: string): OperationalSession => ({
  id: `session-${workspaceId}`,
  workspaceId,
  environment,
  startedAt
});

export const generateWorkflowPreset = (name: string): WorkflowPreset => ({
  id: `preset-${name}`,
  name,
  steps: ["Understand goal", "Validate governance", "Run guided flow", "Review replay", "Close session"]
});

export const createGuidedExecutionFlow = (title: string): GuidedExecutionFlow => ({
  title,
  steps: ["Goal", "Policy", "Constitution", "Approval", "Apply Mock", "Replay", "Summary"],
  explainabilityMode: true
});

export const summarizeCognitiveDecision = (decision: string, why: string): CognitiveDecisionView => ({ summary: decision, why });
export const summarizePolicyDecision = (decision: string): string => `Policy: ${decision}`;
export const summarizeConstitutionalDecision = (decision: string): string => `Constitution: ${decision}`;

export const aggregateTraceTimeline = (events: string[]): string[] => [...events].slice(-20);

export const generateOperatorAlerts = (indicator: RuntimeHealthIndicator, violations: string[]): ConstitutionalAlert[] => {
  const alerts: ConstitutionalAlert[] = [];
  if (indicator.driftScore > 0.7) alerts.push({ severity: "high", message: "Drift escalation risk" });
  if (violations.length > 0) alerts.push({ severity: "critical", message: "Governance violations detected" });
  if (indicator.queuePressure > 0.8) alerts.push({ severity: "medium", message: "Queue pressure elevated" });
  return alerts;
};

export const calculateSystemHealth = (indicator: RuntimeHealthIndicator): SystemHealthOverview => {
  const avg = (indicator.runtimePressure + indicator.memoryPressure + indicator.queuePressure + indicator.driftScore + indicator.escalationScore) / 5;
  return { score: Math.round((1 - avg) * 100), status: avg > 0.75 ? "critical" : avg > 0.5 ? "warning" : "healthy", indicator };
};

export const generateProductionReadiness = (): ProductionReadinessBoard => ({
  mockOnlySubsystems: ["controlled-apply-mock", "demo vertical slice"],
  simulationBoundaries: ["meta-governance simulation", "distributed replay simulation"],
  infraGaps: ["durable external persistence", "real deployment automation"],
  productionBlockers: ["real runtime adapters pending"],
  scalabilityBottlenecks: ["in-memory aggregation limits"],
  trustGaps: ["third-party attestation pending"]
});

export const detectOperatorOverload = (alerts: ConstitutionalAlert[], visibleTraceCount: number): boolean =>
  alerts.length > 3 || visibleTraceCount > 50;

export const simplifyOperationalView = (events: string[], level: OperatorWorkspace["progressiveDisclosureLevel"]): TraceExplorer => {
  if (level === "deep") return { visibleTraces: events, hiddenTraceCount: 0 };
  const limit = level === "standard" ? 20 : 8;
  return { visibleTraces: events.slice(0, limit), hiddenTraceCount: Math.max(0, events.length - limit) };
};

export const createIncidentView = (incidentId: string | undefined): IncidentConsole => ({
  open: typeof incidentId === "string",
  ...(typeof incidentId === "string" ? { activeIncidentId: incidentId } : {}),
  recoveryGuide: "Freeze runtime, inspect constitutional alerts, run replay walkthrough"
});

export const createReplayNavigationModel = (timeline: string[]): ReplayNavigator => ({ timeline, cursor: timeline.length === 0 ? 0 : timeline.length - 1 });

export const createGovernanceMonitor = (violations: string[]): LiveGovernanceMonitor => ({ active: true, violations });

export const loadOperationalPlaybook = (): OperationalPlaybook => ({
  id: "playbook-default",
  title: "Operator Recovery Playbook",
  procedures: ["Assess alerts", "Apply freeze if needed", "Review replay", "Escalate governance"]
});

export const enforceProgressiveDisclosure = (profile: OperatorPermissionProfile, requestedView: OperatorViewType): boolean =>
  profile.allowedViews.includes(requestedView);
