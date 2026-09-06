import type { ProductShell, VerticalSliceScenario } from "../../product-consolidation/types.js";

export const renderProductShell = (shell: ProductShell, scenario: VerticalSliceScenario): string => [
  `Product: ${shell.title}`,
  `Scenario: ${shell.activeScenarioId}`,
  `Human Goal: ${scenario.humanGoal}`,
  `Cognitive Decision: ${scenario.steps.find((s) => s.name === "Cognitive Kernel")?.details ?? ""}`,
  `Policy Decision: ${scenario.policyDecision}`,
  `Constitutional Decision: ${scenario.constitutionalDecision}`,
  `Evidence Chain: ${scenario.evidenceChain.join(",")}`,
  `Proposal Diff: ${scenario.proposalDiff}`,
  `Approval State: ${scenario.approvalState}`,
  `Apply Receipt: ${scenario.applyReceipt || "mock apply executed"}`,
  `Ledger Entry: ${scenario.ledgerEntryId}`,
  `Knowledge Update: ${scenario.knowledgeUpdate}`,
  `Replay Timeline: ${scenario.replayTimeline.length}`,
  `Executive Summary: ${scenario.executiveSummary}`
].join("\n");
