export const factoryDemoScenarios = {
  fullAutonomousFeatureDelivery: () => ["phase1","phase2","phase3","phase4","phase5","phase6","phase7"],
  failedVerificationRecovery: () => ["phase1","phase2","phase3","recover"],
  governanceEscalationStorm: () => ["escalate","review","escalate"],
  dependencyDeadlockRecovery: () => ["blocked","reroute","recover"],
  multiSubteamOrchestration: () => ["alpha","beta","gamma"],
  rollbackRecoveryWorkflow: () => ["rollback-plan","rollback-simulated"],
  evolutionProposalLifecycle: () => ["candidate","proposal","review"],
  approvalBottleneckMitigation: () => ["bottleneck","executive-review","resolved"]
};
