export type StackProvider =
  | "postgresql"
  | "drizzle"
  | "milvus"
  | "docker"
  | "k3s"
  | "kubernetes"
  | "traefik"
  | "cloudflare_tunnel"
  | "tailscale"
  | "kyverno"
  | "hashicorp_vault"
  | "doppler"
  | "terraform";

export type StackComponent = {
  name: string;
  provider: StackProvider;
  required: boolean;
  purpose: string;
};

export type IntegrationBoundary = {
  domain: string;
  allowedProviders: StackProvider[];
  blockedProviders: string[];
};

export type SecurityBoundary = {
  control: string;
  enforcedBy: "kyverno" | "tailscale" | "hashicorp_vault" | "doppler";
  required: boolean;
};

export type KubernetesPolicyProvider = {
  name: "kyverno";
  requiredPolicies: string[];
};

export type PrivateMeshProvider = {
  name: "tailscale";
  capabilities: string[];
};

export type SecretVaultReference = {
  provider: "hashicorp-vault" | "doppler";
  path: string;
  key: string;
};

export type TerraformExecutionRequest = {
  command: "plan" | "apply";
  approvalPackageApproved: boolean;
  policyDecisionPassed: boolean;
  constitutionalValidationPassed: boolean;
  rollbackPlanReady: boolean;
};

export type StackReadiness = {
  productionReady: boolean;
  missingRequired: string[];
  policyReady: boolean;
  privateMeshReady: boolean;
  secretsReady: boolean;
};
