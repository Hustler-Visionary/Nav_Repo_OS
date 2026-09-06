import type { OrganizationGraph } from "./model.js";

export type StrategicKpis = {
  organizationResilienceScore: number;
  strategicRecoveryVelocity: number;
  governanceEffectiveness: number;
  synchronizationFidelity: number;
  operationalIntelligenceScore: number;
  evolutionEmergenceVelocity: number;
  escalationMitigationEfficiency: number;
  replayExplainabilityScore: number;
};

export type EnterpriseHeatmaps = {
  divisionPressureMap: number[];
  governanceSaturationMap: number[];
  escalationStormHeatmap: number[];
  recoveryEfficiencyMap: number[];
  workflowDensityMap: number[];
  strategicRiskMap: number[];
  evolutionEmergenceMap: number[];
};

export const calculateStrategicKpis = (graph: OrganizationGraph): StrategicKpis => ({
  organizationResilienceScore: graph.resilienceScore,
  strategicRecoveryVelocity: graph.organizations[0]?.executionGrid.recoveryVelocity ?? 0,
  governanceEffectiveness: 1 - (graph.organizations[0]?.governanceMesh.saturation ?? 1),
  synchronizationFidelity: graph.synchronization,
  operationalIntelligenceScore: (graph.resilienceScore + graph.synchronization) / 2,
  evolutionEmergenceVelocity: graph.organizations[0]?.evolutionMesh.momentum ?? 0,
  escalationMitigationEfficiency: 1 - (graph.organizations[0]?.executionGrid.escalationDensity ?? 1),
  replayExplainabilityScore: 0.92
});

export const generateEnterpriseHeatmaps = (graph: OrganizationGraph): EnterpriseHeatmaps => ({
  divisionPressureMap: graph.organizations[0]?.divisions.map((d) => 1 - d.performance) ?? [],
  governanceSaturationMap: [graph.organizations[0]?.governanceMesh.saturation ?? 0],
  escalationStormHeatmap: [graph.organizations[0]?.executionGrid.escalationDensity ?? 0],
  recoveryEfficiencyMap: [graph.organizations[0]?.executionGrid.recoveryVelocity ?? 0],
  workflowDensityMap: [graph.organizations[0]?.executionGrid.workflowClusterIds.length ?? 0],
  strategicRiskMap: [0.3],
  evolutionEmergenceMap: [graph.organizations[0]?.evolutionMesh.momentum ?? 0]
});
