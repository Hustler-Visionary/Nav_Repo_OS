import test from "node:test";
import assert from "node:assert/strict";
import { createUnifiedRuntimeKernel, buildRuntimeExecutionPlan, createUnifiedRollbackPlan, executeUnifiedPipeline, freezeUnifiedExecution, replayUnifiedExecution, recordUnifiedLedgerEntry } from "../unified-runtime-kernel/engine.js";
import type { RuntimeExecutionContext, RuntimeExecutionFailure, RuntimeExecutionRequest } from "../unified-runtime-kernel/types.js";

const baseReq: RuntimeExecutionRequest = { id: "r1", humanGoal: "goal", tenantId: "t1", projectId: "p1", externalCapability: true, mutatesState: true, approvalPackageApproved: true, policyDecisionPassed: true, constitutionalDecisionPassed: true, realityBridgePassed: true, controlledApplyPassed: true, vaultReferenceUsed: true };

const mkContext = (request: RuntimeExecutionRequest): RuntimeExecutionContext => ({ request, plan: buildRuntimeExecutionPlan(request), frozen: false });

test("pipeline deterministic", () => {
  const k = createUnifiedRuntimeKernel();
  const a = executeUnifiedPipeline(k, mkContext(baseReq));
  const b = executeUnifiedPipeline(k, mkContext(baseReq));
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

test("missing tenant/project scope blocks", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext({ ...baseReq, tenantId: "" }));
  assert.equal(result.receipt.status, "blocked");
});

test("missing policy decision blocks", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext({ ...baseReq, policyDecisionPassed: false }));
  assert.equal(result.receipt.status, "blocked");
});

test("constitutional deny overrides all", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext({ ...baseReq, constitutionalDecisionPassed: false, policyDecisionPassed: true }));
  assert.equal(result.receipt.status, "blocked");
});

test("external capability resolves through MCP (modeled as governed external path)", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext({ ...baseReq, externalCapability: true }));
  assert.equal(result.receipt.status, "completed");
});

test("external execution passes through Reality Bridge", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext({ ...baseReq, realityBridgePassed: false }));
  assert.equal(result.receipt.status, "blocked");
});

test("mutation passes through Controlled Apply", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext({ ...baseReq, controlledApplyPassed: false }));
  assert.equal(result.receipt.status, "blocked");
});

test("ledger records critical events", () => {
  const ledger = recordUnifiedLedgerEntry("r1", ["unified_pipeline_started", "unified_ledger_entry_recorded"]);
  assert.equal(ledger.appendOnly, true);
});

test("replay reconstructs execution", () => {
  const replay = replayUnifiedExecution(buildRuntimeExecutionPlan(baseReq));
  assert.equal(replay.deterministic, true);
});

test("operator summary generated", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext(baseReq));
  assert.equal(result.operatorSummary.length > 0, true);
});

test("freeze blocks lower layers", () => {
  const k = createUnifiedRuntimeKernel();
  const frozen = freezeUnifiedExecution(mkContext(baseReq), { id: "lock-1", reason: "incident" });
  const result = executeUnifiedPipeline(k, frozen);
  assert.equal(result.receipt.status, "frozen");
});

test("rollback plan generated on failure", () => {
  const failure: RuntimeExecutionFailure = { requestId: "r1", stage: "verification", reason: "failed" };
  const rollback = createUnifiedRollbackPlan(failure);
  assert.equal(rollback.ready, true);
});
