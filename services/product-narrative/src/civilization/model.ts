export type AutonomousDivision = { id: string; name: string; departments: string[]; subteams: string[]; performance: number };
export type StrategicWorkflowCluster = { id: string; workflowIds: string[]; risk: number; confidence: number; throughput: number };
export type GovernanceMesh = { id: string; active: boolean; nodes: string[]; saturation: number; interventions: string[] };
export type EvolutionMesh = { id: string; proposals: string[]; momentum: number; antiDegradationScore: number };
export type EnterpriseExecutionGrid = { id: string; divisionIds: string[]; workflowClusterIds: string[]; escalationDensity: number; recoveryVelocity: number };
export type AutonomousOrganization = { id: string; name: string; divisions: AutonomousDivision[]; governanceMesh: GovernanceMesh; evolutionMesh: EvolutionMesh; executionGrid: EnterpriseExecutionGrid };
export type OrganizationGraph = { id: string; organizations: AutonomousOrganization[]; synchronization: number; resilienceScore: number; replayId: string };

export const createOrganizationGraph = (id: string): OrganizationGraph => ({
  id,
  replayId: `civilization-replay-${id}`,
  synchronization: 0.82,
  resilienceScore: 0.86,
  organizations: [{
    id: "org-1",
    name: "TST Autonomous Enterprise",
    divisions: [
      { id: "div-1", name: "Platform", departments: ["Runtime", "Governance"], subteams: ["alpha", "beta"], performance: 0.83 },
      { id: "div-2", name: "Product", departments: ["Experience", "Delivery"], subteams: ["gamma", "delta"], performance: 0.8 }
    ],
    governanceMesh: { id: "mesh-gov-1", active: true, nodes: ["board", "risk", "audit"], saturation: 0.4, interventions: [] },
    evolutionMesh: { id: "mesh-evo-1", proposals: ["resilience-policy"], momentum: 0.7, antiDegradationScore: 0.9 },
    executionGrid: { id: "grid-1", divisionIds: ["div-1", "div-2"], workflowClusterIds: ["cluster-1"], escalationDensity: 0.2, recoveryVelocity: 0.78 }
  }]
});

export const activateGovernanceMesh = (org: AutonomousOrganization): AutonomousOrganization => ({ ...org, governanceMesh: { ...org.governanceMesh, active: true } });
export const strategicReroute = (cluster: StrategicWorkflowCluster): StrategicWorkflowCluster => ({ ...cluster, throughput: cluster.throughput + 0.05, risk: Math.max(0, cluster.risk - 0.1) });
