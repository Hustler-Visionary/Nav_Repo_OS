import type { ChangeProposal, ChangeProposalGroup, ProposalState, ProposedDiff, ProposedFileChange } from "./types.js";

export const generateStructuredPatch = (changes: ProposedFileChange[]): string => changes.map((c) => `--- ${c.path}\n+++ ${c.path}\n- ${c.before}\n+ ${c.after}`).join("\n");

export const estimateBlastRadius = (changes: ProposedFileChange[]): number => changes.reduce((acc, change) => acc + change.affectedDependencies.length + change.riskScore, 0);
export const estimateRollbackComplexity = (changes: ProposedFileChange[]): number => changes.reduce((acc, change) => acc + change.rollbackNotes.length / 100, 0);

export const explainDiff = (changes: ProposedFileChange[]): string => changes.map((c) => `${c.path}: ${c.rationale}`).join(" | ");

export const generateProposedDiff = (changes: ProposedFileChange[]): ProposedDiff => {
  const blast = estimateBlastRadius(changes);
  const rollbackComplexity = estimateRollbackComplexity(changes);
  return {
    files: changes,
    explanation: explainDiff(changes),
    structuredPatch: generateStructuredPatch(changes),
    risk: { blastRadius: blast, unsafe: blast > 8, reason: blast > 8 ? "blast radius high" : "within bounds" },
    rollback: { complexity: rollbackComplexity, notes: "rollback by reversing proposed lines", simulated: false }
  };
};

export const validateProposalStructure = (proposal: ChangeProposal): boolean => proposal.diff.files.length > 0 && proposal.evidenceChain.evidenceBundleIds.length > 0;
export const validateProposalScope = (proposal: ChangeProposal, allowedPaths: string[], protectedRoots: string[]): boolean =>
  proposal.diff.files.every((f) => allowedPaths.some((p) => f.path.startsWith(p)) && !protectedRoots.some((r) => f.path.startsWith(r)));
export const validateProposalDependencies = (proposal: ChangeProposal): boolean => proposal.diff.files.every((f) => f.affectedDependencies.length >= 0);
export const validateProposalRollback = (proposal: ChangeProposal): boolean => proposal.diff.rollback.complexity <= 10;
export const validateProposalGovernance = (proposal: ChangeProposal): boolean => proposal.confidence.score >= 0.5 && !proposal.diff.risk.unsafe;

export const simulateProposalApply = (proposal: ChangeProposal): { success: boolean; notes: string } => ({ success: !proposal.diff.risk.unsafe, notes: proposal.diff.risk.unsafe ? "unsafe blast radius" : "simulation passed" });
export const simulateDependencyImpact = (proposal: ChangeProposal): number => proposal.diff.files.reduce((acc, file) => acc + file.affectedDependencies.length, 0);
export const simulateRollback = (proposal: ChangeProposal): boolean => proposal.diff.rollback.complexity < 8;
export const simulateFailureModes = (proposal: ChangeProposal): string[] => proposal.diff.risk.unsafe ? ["blast_radius_exceeded"] : [];

const allowedTransitions: Record<ProposalState, ProposalState[]> = {
  DRAFT: ["EVIDENCE_LINKED", "REJECTED"], EVIDENCE_LINKED: ["VALIDATED", "REJECTED"], VALIDATED: ["SIMULATED", "REJECTED"], SIMULATED: ["GOVERNANCE_REVIEW", "REJECTED"],
  GOVERNANCE_REVIEW: ["APPROVAL_REQUIRED", "REJECTED"], APPROVAL_REQUIRED: ["APPROVED", "REJECTED"], APPROVED: ["APPLY_READY"], REJECTED: [], APPLY_READY: ["APPLIED", "ROLLED_BACK"], APPLIED: ["ROLLED_BACK"], ROLLED_BACK: []
};
export const transitionProposalState = (state: ProposalState, next: ProposalState): boolean => allowedTransitions[state].includes(next);

export const replayProposal = (proposal: ChangeProposal): string => `proposal_replay:${proposal.id}`;
export const replayProposalSimulation = (proposal: ChangeProposal): string => `proposal_sim:${proposal.id}:${simulateProposalApply(proposal).notes}`;
export const compareProposalVersions = (a: ChangeProposal, b: ChangeProposal): string => a.diff.structuredPatch === b.diff.structuredPatch ? "same" : "different";
export const explainProposalEvolution = (proposal: ChangeProposal): string => `lineage:${proposal.lineage.join("->")}`;

export const detectDuplicateProposal = (proposal: ChangeProposal, candidates: ChangeProposal[]): boolean => candidates.some((p) => p.id !== proposal.id && p.diff.structuredPatch === proposal.diff.structuredPatch);
export const detectConflictingProposal = (proposal: ChangeProposal, candidates: ChangeProposal[]): boolean => candidates.some((p) => p.id !== proposal.id && p.diff.files.some((f) => proposal.diff.files.some((pf) => pf.path === f.path && pf.after !== f.after)));

export const groupProposals = (proposals: ChangeProposal[]): ChangeProposalGroup => ({
  id: "group-1",
  proposals,
  refactors: [{ id: "ref-1", chain: proposals.map((p) => p.id), impactScore: proposals.reduce((a, p) => a + p.diff.risk.blastRadius, 0) }],
  graphImpactScore: proposals.reduce((a, p) => a + p.diff.risk.blastRadius, 0)
});
