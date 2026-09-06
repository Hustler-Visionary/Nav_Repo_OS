export type MetaGovernanceState =
  | "proposed"
  | "simulated"
  | "governance_review"
  | "constitutional_review"
  | "consensus_required"
  | "approved"
  | "rejected"
  | "frozen"
  | "recovery_required";

export type EvolutionRiskEnvelope = {
  score: number;
  rollbackReady: boolean;
  unsafeMutation: boolean;
};

export type EvolutionLineage = {
  chain: string[];
  integrityHash: string;
};

export type ConstitutionalEvolutionProposal = {
  id: string;
  title: string;
  state: MetaGovernanceState;
  simulationCompleted: boolean;
  rollbackReady: boolean;
  lineage: EvolutionLineage;
};

export type ConstitutionalAmendment = {
  id: string;
  proposalId: string;
  approved: boolean;
};

export type SovereignIdentity = {
  constitutionalIdentity: string;
  governanceLineage: string;
  invariantsHash: string;
  trustContinuity: boolean;
  replayContinuity: boolean;
  institutionalMemoryIntegrity: boolean;
  tenantSovereignty: boolean;
};

export type CivilizationState = {
  fragmented: boolean;
  governanceOrphaning: boolean;
  replayDiscontinuity: boolean;
  memoryCollapse: boolean;
};

export type CivilizationContinuity = {
  valid: boolean;
  reason: string;
};

export type GovernanceEpoch = {
  id: string;
  version: number;
  startedAt: string;
};

export type SystemIdentityProof = {
  hash: string;
  verified: boolean;
};

export type EvolutionSimulation = {
  proposalId: string;
  sandboxed: boolean;
  replayGenerated: boolean;
  rollbackValidated: boolean;
  invariantsValidated: boolean;
  precedenceValidated: boolean;
  semanticFirewallPersistent: boolean;
};

export type MetaGovernanceDecision = {
  allowed: boolean;
  reason: string;
};

export type SovereignConsensus = {
  threshold: number;
  approvals: number;
};

export type ConstitutionalDrift = {
  silentGovernanceDrift: boolean;
  policyDrift: boolean;
  cognitionDrift: boolean;
  evolutionDrift: boolean;
  replayInconsistency: boolean;
  authorityErosion: boolean;
  trustDegradation: boolean;
  sovereigntyDegradation: boolean;
};

export type StructuralMutation = {
  id: string;
  safe: boolean;
};

export type IdentityIntegrityReport = {
  valid: boolean;
  reason: string;
};

export type CivilizationRecoveryFrame = {
  id: string;
  deterministic: boolean;
  recovered: boolean;
};

export type GovernanceContinuitySnapshot = {
  epochId: string;
  lineageHash: string;
};

export type MetaGovernanceKernel = {
  id: string;
  frozen: boolean;
};
