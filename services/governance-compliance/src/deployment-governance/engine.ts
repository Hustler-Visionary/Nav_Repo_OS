import type {
  ConfigIntegrityCheck,
  DeploymentEnvironment,
  DeploymentReadinessReport,
  EnvironmentBoundary,
  ObservabilityContract,
  ProductionGoNoGoDecision,
  PromotionPolicy,
  ReleaseGate,
  SecretsPolicy
} from "./types.js";

export const defaultPromotionPolicy = (): PromotionPolicy => ({
  requireReleaseGate: true,
  requireRollbackPlanForStagingProduction: true,
  requireObservabilityForProduction: true,
  requireEmergencyStopForProduction: true
});

export const verifyEnvironmentBoundary = (boundary: EnvironmentBoundary, scope: string): boolean =>
  boundary.allowedScopes.some((allowed) => scope.startsWith(allowed)) && !boundary.blockedScopes.some((blocked) => scope.startsWith(blocked));

export const verifyConfigIntegrity = (currentHash: string, expectedHash: string): ConfigIntegrityCheck => ({
  driftDetected: currentHash !== expectedHash,
  details: currentHash === expectedHash ? "config_integrity_verified" : "config_drift_detected"
});

export const redactSecretsInTrace = (payload: Record<string, string>, policy: SecretsPolicy): Record<string, string> => {
  if (!policy.redactionEnabled) return payload;
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, policy.forbiddenKeys.includes(key) ? "[REDACTED]" : value]));
};

export const verifyReleaseGates = (gates: ReleaseGate[]): boolean => gates.every((gate) => gate.passed);

export const canPromote = (
  environment: DeploymentEnvironment,
  report: DeploymentReadinessReport,
  policy: PromotionPolicy
): { allowed: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  if (!report.testsPassed) reasons.push("failed tests bloquean release");
  if (policy.requireReleaseGate && !verifyReleaseGates(report.releaseGates)) reasons.push("release gate failed");
  if (report.configIntegrity.driftDetected) reasons.push("config drift bloquea promotion");
  if ((environment === "staging" || environment === "production") && policy.requireRollbackPlanForStagingProduction && !report.rollbackPlanAvailable) reasons.push("rollback plan requerido");
  if (environment === "production" && policy.requireObservabilityForProduction && !report.observabilityContract) reasons.push("observability contract requerido");
  if (environment === "production" && policy.requireEmergencyStopForProduction && !report.emergencyStopReady) reasons.push("emergency stop requerido");
  return { allowed: reasons.length === 0, reasons };
};

export const verifyObservabilityContract = (contract: ObservabilityContract | undefined): boolean => Boolean(contract?.logs && contract?.metrics && contract?.traces);

export const productionGoNoGoDecision = (report: DeploymentReadinessReport, policy: PromotionPolicy): ProductionGoNoGoDecision => {
  const result = canPromote("production", report, policy);
  return { decision: result.allowed ? "go" : "no-go", reasons: result.reasons };
};
