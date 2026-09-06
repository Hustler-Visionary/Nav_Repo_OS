import type { EvolutionProposal, RuleCandidate } from "../../governance/types.js";

export const renderEvolutionSurface = (rules: RuleCandidate[], proposals: EvolutionProposal[]): string => {
  const ruleLines = rules.map((r) => `rule:${r.id} ${r.summary} status:${r.status}`).join("\n");
  const proposalLines = proposals.map((p) => `proposal:${p.id} risk:${p.risk} status:${p.status} modules:${p.affectedModules.join(",")}`).join("\n");
  return `EvolutionSurface\nRules:\n${ruleLines || "none"}\nProposals:\n${proposalLines || "none"}`;
};
