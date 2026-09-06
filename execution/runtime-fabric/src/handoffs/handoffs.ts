import type { RuntimeExecutionSession } from "../runtime-simulation/types.js";

export type HandoffContract = { taskId: string; fromAgentId: string; toAgentId: string; verificationOwner: string; escalationOwner: string; dependencyRefs: string[] };

export const executeHandoff = (session: RuntimeExecutionSession, contract: HandoffContract): { session: RuntimeExecutionSession; events: string[] } => {
  const from = session.agents.find((a) => a.id === contract.fromAgentId);
  const to = session.agents.find((a) => a.id === contract.toAgentId);
  if (!from || !to || from.activeTask !== contract.taskId) return { session, events: ["handoff_failed"] };
  const agents = session.agents.map((a) => {
    if (a.id === from.id) return { ...a, activeTask: undefined };
    if (a.id === to.id) return { ...a, activeTask: contract.taskId, verificationPartner: contract.verificationOwner };
    return a;
  });
  return { session: { ...session, agents }, events: ["handoff_started", "ownership_transferred", "handoff_completed"] };
};
