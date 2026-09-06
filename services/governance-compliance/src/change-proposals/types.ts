export type ProposalState = "DRAFT" | "EVIDENCE_LINKED" | "VALIDATED" | "SIMULATED" | "GOVERNANCE_REVIEW" | "APPROVAL_REQUIRED" | "APPROVED" | "REJECTED" | "APPLY_READY" | "APPLIED" | "ROLLED_BACK";

export type ProposedFileChange = { path: string; before: string; after: string; rationale: string; evidenceRefs: string[]; affectedDependencies: string[]; riskScore: number; confidence: number; rollbackNotes: string };
export type ProposedDependencyChange = { from: string; to: string; type: "add" | "remove" | "update" };
export type ProposedRefactor = { id: string; chain: string[]; impactScore: number };
export type ProposedRisk = { blastRadius: number; unsafe: boolean; reason: string };
export type ProposedRollback = { complexity: number; notes: string; simulated: boolean };
export type ProposalEvidenceChain = { evidenceBundleIds: string[]; sourceHashes: string[]; trustScore: number; dependencyRefs: string[]; traceRefs: string[]; governanceRefs: string[] };
export type ProposalValidation = { structureValid: boolean; scopeValid: boolean; dependenciesValid: boolean; rollbackValid: boolean; governanceValid: boolean; reasons: string[] };
export type ProposalConfidence = { score: number; sourceConfidence: number; simulationConfidence: number };

export type ProposedDiff = { files: ProposedFileChange[]; explanation: string; structuredPatch: string; risk: ProposedRisk; rollback: ProposedRollback };
export type ChangeProposal = { id: string; title: string; state: ProposalState; diff: ProposedDiff; evidenceChain: ProposalEvidenceChain; validation: ProposalValidation; confidence: ProposalConfidence; lineage: string[]; ancestry: string[] };
export type ChangeProposalGroup = { id: string; proposals: ChangeProposal[]; refactors: ProposedRefactor[]; graphImpactScore: number };
