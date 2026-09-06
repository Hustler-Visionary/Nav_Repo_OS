export * from "./external-integration/types.js";
export * from "./external-integration/engine.js";

export * from "./mcp-fabric/types.js";
export * from "./mcp-fabric/engine.js";

export * from "./saas-control-plane/types.js";
export * from "./saas-control-plane/engine.js";

// stack-definition/types.ts also exports a `SecretVaultReference` -- the
// external-integration one (already re-exported above) wins the bare name,
// this one is aliased to stay reachable without an export collision.
export type { SecretVaultReference as StackSecretVaultReference } from "./stack-definition/types.js";
export {
  type StackProvider,
  type StackComponent,
  type IntegrationBoundary,
  type SecurityBoundary,
  type KubernetesPolicyProvider,
  type PrivateMeshProvider,
  type TerraformExecutionRequest,
  type StackReadiness
} from "./stack-definition/types.js";
export * from "./stack-definition/engine.js";

export * from "./reality-bridge/types.js";
export * from "./reality-bridge/engine.js";
