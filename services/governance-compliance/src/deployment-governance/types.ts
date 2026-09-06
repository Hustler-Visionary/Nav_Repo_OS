export type DeploymentEnvironment = "local" | "preview" | "staging" | "production";

export type ReleaseGate = {
  id: string;
  name: string;
  passed: boolean;
  reason: string;
};

export type PromotionPolicy = {
  requireReleaseGate: boolean;
  requireRollbackPlanForStagingProduction: boolean;
  requireObservabilityForProduction: boolean;
  requireEmergencyStopForProduction: boolean;
};

export type EnvironmentBoundary = {
  environment: DeploymentEnvironment;
  allowedScopes: string[];
  blockedScopes: string[];
};

export type ConfigIntegrityCheck = {
  driftDetected: boolean;
  details: string;
};

export type SecretsPolicy = {
  redactionEnabled: boolean;
  forbiddenKeys: string[];
};

export type ObservabilityContract = {
  logs: boolean;
  metrics: boolean;
  traces: boolean;
};

export type DeploymentReadinessReport = {
  environment: DeploymentEnvironment;
  testsPassed: boolean;
  rollbackPlanAvailable: boolean;
  emergencyStopReady: boolean;
  releaseGates: ReleaseGate[];
  configIntegrity: ConfigIntegrityCheck;
  secretsPolicy: SecretsPolicy;
  observabilityContract?: ObservabilityContract;
};

export type ProductionGoNoGoDecision = {
  decision: "go" | "no-go";
  reasons: string[];
};
