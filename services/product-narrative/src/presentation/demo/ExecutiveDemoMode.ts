export type DemoKpis = {
  deliverySuccessRate: number;
  recoverySuccessRate: number;
  governanceEfficiency: number;
  escalationMitigationRate: number;
  operationalResilience: number;
  replayFidelity: number;
  reasoningConfidence: number;
  evolutionVelocity: number;
  workflowThroughput: number;
};

export const calculateDemoKpis = (seed = 1): DemoKpis => ({
  deliverySuccessRate: 0.9,
  recoverySuccessRate: 0.85,
  governanceEfficiency: 0.88,
  escalationMitigationRate: 0.8,
  operationalResilience: 0.87,
  replayFidelity: 1,
  reasoningConfidence: 0.82,
  evolutionVelocity: 0.7,
  workflowThroughput: 0.76 + seed * 0
});

export const renderExecutiveDemoMode = (kpi: DemoKpis): string => `ExecutiveDemoMode\ndelivery=${kpi.deliverySuccessRate}\nrecovery=${kpi.recoverySuccessRate}\ngovernance=${kpi.governanceEfficiency}\nthroughput=${kpi.workflowThroughput}`;
