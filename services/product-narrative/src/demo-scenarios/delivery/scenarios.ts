export const deliveryDemoScenarios = {
  buildFullFeatureAutonomously: () => ["interpret", "plan", "implement", "verify", "governance", "complete"],
  recoverFromVerificationCollapse: () => ["verify-fail", "diagnose", "recover", "verify-pass"],
  rerouteBlockedDependency: () => ["blocked", "reroute", "resume"],
  surviveEscalationStorm: () => ["escalate", "freeze", "recover", "resolve"],
  autonomousGovernanceRecovery: () => ["governance-block", "review", "resume"],
  crossSubteamCoordination: () => ["alpha", "beta", "gamma", "handoff"],
  evolutionProposalLifecycle: () => ["detect", "candidate", "proposal", "review"],
  rollbackRecovery: () => ["rollback-plan", "rollback-sim", "recover"],
  deliveryBottleneckMitigation: () => ["bottleneck", "reroute", "throughput-up"],
  autonomousReplayExplanation: () => ["replay-start", "focus-shift", "story", "replay-end"]
};
