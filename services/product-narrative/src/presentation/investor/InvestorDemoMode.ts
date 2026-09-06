import type { OrganizationGraph } from "../../civilization/model.js";
import { renderExecutiveCommandCenter } from "../strategic/ExecutiveCommandCenter.js";

export const renderInvestorDemoMode = (graph: OrganizationGraph): string => `InvestorDemoMode\n${renderExecutiveCommandCenter(graph)}\nmessage:autonomous coordination + governed resilience + deterministic replay`;
