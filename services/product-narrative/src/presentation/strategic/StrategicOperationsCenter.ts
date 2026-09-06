import type { OrganizationGraph } from "../../civilization/model.js";
import { calculateStrategicKpis } from "../../civilization/intelligence.js";

export const renderStrategicOperationsCenter = (graph: OrganizationGraph): string => {
  const kpi = calculateStrategicKpis(graph);
  return `StrategicOperationsCenter\nhealth:${kpi.organizationResilienceScore}\ngovernancePressure:${1-kpi.governanceEffectiveness}\nescalationDensity:${1-kpi.escalationMitigationEfficiency}\nintelligence:${kpi.operationalIntelligenceScore}\nsync:${kpi.synchronizationFidelity}`;
};
