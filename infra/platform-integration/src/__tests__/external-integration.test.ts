import test from "node:test";
import assert from "node:assert/strict";
import { createMCPRuntimeBridge, createMCPToolExecutionGateway, createTerraformPlanPreview, redactExternalSecretOutput, registerInfrastructureProvider, registerMCPExternalConnector, resolveVaultSecretReference, validateConnectorDisabledByDefault, validateDeploymentTarget, validateMCPExternalExecution, validateTerraformApplyRequest, verifyDrizzleDatabaseBoundary, verifyKyvernoPolicyReadiness, verifyMilvusVectorBoundary, verifyTailscalePrivateMesh } from "../external-integration/engine.js";

test("all providers disabled by default", () => {
  const providers = registerInfrastructureProvider([], { id: "p1", name: "GitHub", type: "github", enabled: true, readonlyByDefault: true });
  assert.equal(providers[0]?.enabled, false);
});

test("sandbox isolation enforced", () => {
  assert.equal(validateDeploymentTarget({ environment: "staging", previewReady: true, kyvernoReady: true, tailscaleReady: true }), true);
  assert.equal(validateDeploymentTarget({ environment: "staging", previewReady: true, kyvernoReady: false, tailscaleReady: true }), false);
});

test("secrets boundaries enforced", () => {
  const redacted = redactExternalSecretOutput("token=abc password:xyz");
  assert.equal(redacted.includes("abc"), false);
  assert.equal(redacted.includes("xyz"), false);
});

test("Vault reference required for production secrets", () => {
  assert.equal(resolveVaultSecretReference({ provider: "hashicorp-vault", path: "secret/p", key: "K" })?.provider, "hashicorp-vault");
  assert.equal(resolveVaultSecretReference({ provider: "doppler", path: "x", key: "K" }), null);
});

test("Terraform plan allowed", () => {
  const plan = createTerraformPlanPreview("staging", "no-op");
  assert.equal(plan.sandboxed, true);
});

test("Terraform apply blocked without approval/policy/constitution/rollback", () => {
  assert.equal(validateTerraformApplyRequest({ approvalPackageApproved: false, policyDecisionAllow: true, constitutionalValidationPassed: true, rollbackPlanExists: true, blastRadiusWithinThreshold: true, environment: "staging", promotionExplicit: false, traceReceiptEmitted: true, ledgerEntryRecorded: true, forceDestroy: false }), false);
});

test("Kyverno required before production-ready", () => {
  assert.equal(verifyKyvernoPolicyReadiness({ ready: true, rulesValidated: [] }), true);
  assert.equal(verifyKyvernoPolicyReadiness({ ready: false, rulesValidated: [] }), false);
});

test("Tailscale required for private admin/runtime access", () => {
  assert.equal(verifyTailscalePrivateMesh({ id: "m1", privateAdminAccess: true, workerToControlPlane: true, emergencyOperatorAccess: true, observabilityAccess: true, zeroTrustRouting: true }), true);
});

test("Drizzle canonical and Prisma blocked", () => {
  assert.equal(verifyDrizzleDatabaseBoundary({ provider: "drizzle", prismaBlocked: true, tenantBoundaryValidated: true, appendOnlyLedgerCompatible: true }), true);
});

test("Milvus canonical and Qdrant blocked", () => {
  assert.equal(verifyMilvusVectorBoundary({ provider: "milvus", tenantId: "t1", projectId: "p1", mutationRequiresApproval: true }), true);
});

test("MCP external connector disabled by default", () => {
  const connectors = registerMCPExternalConnector([], { id: "c1", provider: "mcp-github", enabled: true, requiresAuditReceipt: true, replayable: true });
  assert.equal(connectors[0]?.enabled, false);
});

test("MCP external execution governance requirements", () => {
  const bridge = createMCPRuntimeBridge();
  const gateway = createMCPToolExecutionGateway();
  assert.equal(bridge.policyBound && bridge.constitutionalBound, true);
  assert.equal(validateMCPExternalExecution({ id: "c1", provider: "mcp-github", enabled: false, requiresAuditReceipt: true, replayable: true }, gateway, true, true, true, true, false), true);
});

test("connector model enforces disabled flag helper", () => {
  assert.equal(validateConnectorDisabledByDefault({ id: "x", providerId: "p1", tenantId: "t1", projectId: "p1", enabled: false }), true);
});
