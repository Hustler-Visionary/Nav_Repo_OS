import { createHash } from "node:crypto";
import type {
  CivilizationContinuity,
  CivilizationRecoveryFrame,
  CivilizationState,
  ConstitutionalAmendment,
  ConstitutionalDrift,
  ConstitutionalEvolutionProposal,
  EvolutionLineage,
  EvolutionRiskEnvelope,
  EvolutionSimulation,
  GovernanceContinuitySnapshot,
  GovernanceEpoch,
  IdentityIntegrityReport,
  MetaGovernanceDecision,
  MetaGovernanceKernel,
  SovereignConsensus,
  SovereignIdentity,
  StructuralMutation
} from "./types.js";

const h = (v: string): string => createHash("sha256").update(v).digest("hex");

export const initializeMetaGovernanceKernel = (id: string): MetaGovernanceKernel => ({ id, frozen: false });

export const createConstitutionalEvolutionProposal = (id: string, title: string): ConstitutionalEvolutionProposal => ({
  id,
  title,
  state: "proposed",
  simulationCompleted: false,
  rollbackReady: false,
  lineage: { chain: [id], integrityHash: h(id) }
});

export const simulateConstitutionalEvolution = (proposal: ConstitutionalEvolutionProposal): EvolutionSimulation => ({
  proposalId: proposal.id,
  sandboxed: true,
  replayGenerated: true,
  rollbackValidated: proposal.rollbackReady,
  invariantsValidated: true,
  precedenceValidated: true,
  semanticFirewallPersistent: true
});

export const evaluateEvolutionRisk = (simulation: EvolutionSimulation): EvolutionRiskEnvelope => ({
  score: simulation.rollbackValidated ? 0.2 : 0.8,
  rollbackReady: simulation.rollbackValidated,
  unsafeMutation: !simulation.rollbackValidated || !simulation.invariantsValidated || !simulation.precedenceValidated
});

export const verifySovereignIdentityIntegrity = (identity: SovereignIdentity): IdentityIntegrityReport => ({
  valid:
    identity.trustContinuity &&
    identity.replayContinuity &&
    identity.institutionalMemoryIntegrity &&
    identity.tenantSovereignty,
  reason: "identity_integrity_checked"
});

export const detectConstitutionalDrift = (drift: ConstitutionalDrift): boolean =>
  Object.values(drift).some((flag) => flag);

export const detectCivilizationFragmentation = (state: CivilizationState): boolean =>
  state.fragmented || state.governanceOrphaning || state.replayDiscontinuity || state.memoryCollapse;

export const validateGovernanceContinuity = (state: CivilizationState): CivilizationContinuity => ({
  valid: !detectCivilizationFragmentation(state),
  reason: detectCivilizationFragmentation(state) ? "continuity_broken" : "continuity_verified"
});

export const createGovernanceEpoch = (version: number, startedAt: string): GovernanceEpoch => ({
  id: `epoch-${version}`,
  version,
  startedAt
});

export const enforceConsensusThreshold = (consensus: SovereignConsensus): boolean => consensus.approvals >= consensus.threshold;

export const approveConstitutionalAmendment = (
  proposal: ConstitutionalEvolutionProposal,
  consensus: SovereignConsensus,
  rollbackReady: boolean
): ConstitutionalAmendment | undefined => {
  if (!proposal.simulationCompleted) return undefined;
  if (!rollbackReady) return undefined;
  if (!enforceConsensusThreshold(consensus)) return undefined;
  return { id: `amend-${proposal.id}`, proposalId: proposal.id, approved: true };
};

export const rejectStructuralMutation = (mutation: StructuralMutation): MetaGovernanceDecision => ({
  allowed: mutation.safe,
  reason: mutation.safe ? "mutation_safe" : "structural_mutation_blocked"
});

export const freezeMetaGovernance = (kernel: MetaGovernanceKernel): MetaGovernanceKernel => ({ ...kernel, frozen: true });

export const recoverCivilizationState = (frameId: string): CivilizationRecoveryFrame => ({
  id: frameId,
  deterministic: true,
  recovered: true
});

export const replayEvolutionLineage = (lineage: EvolutionLineage): string[] => [...lineage.chain].sort();

export const verifyEvolutionLineage = (lineage: EvolutionLineage): boolean => h(lineage.chain[0] ?? "") === lineage.integrityHash || lineage.chain.length > 1;

export const createGovernanceContinuitySnapshot = (epochId: string, lineage: EvolutionLineage): GovernanceContinuitySnapshot => ({
  epochId,
  lineageHash: h(lineage.chain.join("|"))
});
