import type {
  IntegrationBoundary,
  KubernetesPolicyProvider,
  PrivateMeshProvider,
  SecurityBoundary,
  SecretVaultReference,
  StackComponent,
  StackReadiness,
  TerraformExecutionRequest
} from "./types.js";

export const canonicalStackComponents = (): StackComponent[] => [
  { name: "PostgreSQL", provider: "postgresql", required: true, purpose: "primary persistence" },
  { name: "Drizzle ORM", provider: "drizzle", required: true, purpose: "canonical ORM" },
  { name: "Milvus", provider: "milvus", required: true, purpose: "primary vector database" },
  { name: "Docker", provider: "docker", required: true, purpose: "container runtime" },
  { name: "K3s/Kubernetes", provider: "kubernetes", required: true, purpose: "orchestration" },
  { name: "Traefik", provider: "traefik", required: true, purpose: "ingress" },
  { name: "Cloudflare Tunnel", provider: "cloudflare_tunnel", required: true, purpose: "edge ingress tunnel" },
  { name: "Tailscale", provider: "tailscale", required: true, purpose: "private mesh" },
  { name: "Kyverno", provider: "kyverno", required: true, purpose: "kubernetes policy enforcement" },
  { name: "HashiCorp Vault", provider: "hashicorp_vault", required: true, purpose: "canonical secrets manager" },
  { name: "Doppler", provider: "doppler", required: false, purpose: "dev/staging secrets alternative" },
  { name: "HashiCorp Terraform", provider: "terraform", required: true, purpose: "declarative provisioning via plan/preview-first" }
];

export const canonicalKubernetesPolicyProvider = (): KubernetesPolicyProvider => ({
  name: "kyverno",
  requiredPolicies: [
    "namespaces por tenant/env",
    "no privileged pods",
    "image policies",
    "resource limits",
    "secret mounting rules",
    "runtime boundaries",
    "deployment approval annotations"
  ]
});

export const canonicalPrivateMeshProvider = (): PrivateMeshProvider => ({
  name: "tailscale",
  capabilities: [
    "private admin mesh",
    "worker-to-control-plane secure access",
    "emergency operator access",
    "private observability access",
    "zero-trust internal routing"
  ]
});

export const canonicalIntegrationBoundaries = (): IntegrationBoundary[] => [
  { domain: "vector", allowedProviders: ["milvus", "postgresql"], blockedProviders: ["qdrant"] },
  { domain: "orm", allowedProviders: ["drizzle"], blockedProviders: ["prisma"] },
  { domain: "secrets", allowedProviders: ["hashicorp_vault", "doppler"], blockedProviders: ["plain_env_values"] },
  { domain: "iac", allowedProviders: ["terraform"], blockedProviders: ["imperative_unreviewed_apply"] }
];

export const canonicalSecurityBoundaries = (): SecurityBoundary[] => [
  { control: "kubernetes policy enforcement", enforcedBy: "kyverno", required: true },
  { control: "private admin/runtime mesh", enforcedBy: "tailscale", required: true },
  { control: "production secrets manager", enforcedBy: "hashicorp_vault", required: true }
];

export const evaluateStackReadiness = (components: StackComponent[]): StackReadiness => {
  const required = components.filter((component) => component.required);
  const missingRequired = required.filter((component) => !component.provider).map((component) => component.name);
  const providers = components.map((component) => component.provider);
  const policyReady = providers.includes("kyverno");
  const privateMeshReady = providers.includes("tailscale");
  const secretsReady = providers.includes("hashicorp_vault");
  return {
    productionReady: missingRequired.length === 0 && policyReady && privateMeshReady && secretsReady,
    missingRequired,
    policyReady,
    privateMeshReady,
    secretsReady
  };
};

export const isValidSecretReference = (reference: SecretVaultReference): boolean =>
  reference.path.length > 0 && reference.key.length > 0 && (reference.provider === "hashicorp-vault" || reference.provider === "doppler");

export const canRunTerraform = (request: TerraformExecutionRequest): { allowed: boolean; reason: string } => {
  if (request.command === "plan") return { allowed: true, reason: "terraform plan allowed" };
  const ok =
    request.approvalPackageApproved &&
    request.policyDecisionPassed &&
    request.constitutionalValidationPassed &&
    request.rollbackPlanReady;
  return ok ? { allowed: true, reason: "terraform apply authorized" } : { allowed: false, reason: "terraform apply blocked without full governance" };
};

export const redactSecretsFromOutput = (payload: string): string => payload.replace(/(secret|token|password|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi, "$1=[REDACTED]");
