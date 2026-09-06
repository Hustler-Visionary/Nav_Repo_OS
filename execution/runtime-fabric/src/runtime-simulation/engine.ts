import type { RuntimeAgent, RuntimeExecutionSession, RuntimeTask } from "./types.js";

export const createRuntimeSession = (id: string, goal: string, agents: RuntimeAgent[], tasks: RuntimeTask[]): RuntimeExecutionSession => ({
  id,
  goal,
  state: "WAITING",
  agents,
  queue: { pending: [...tasks], blocked: [], active: [], completed: [] },
  cycles: [],
  decisionFrames: [],
  concurrencyLimit: 2,
  replayCursor: 0,
  governancePaused: false,
  emergencyStop: false,
  resourceBudget: 100,
  tokenBudget: 1000
});

export const scheduleTasks = (session: RuntimeExecutionSession): RuntimeExecutionSession => {
  if (session.governancePaused || session.emergencyStop) return session;
  const resolved = session.queue.pending.filter((t) => t.dependencies.every((d) => session.queue.completed.some((c) => c.id === d)));
  const unresolved = session.queue.pending.filter((t) => !resolved.includes(t));
  const sorted = [...resolved].sort((a, b) => b.priority - a.priority);
  const selected = sorted.slice(0, Math.max(0, session.concurrencyLimit - session.queue.active.length));
  const active = [...session.queue.active, ...selected.map((t) => ({ ...t, state: "EXECUTING" as const }))];
  const pending = unresolved.concat(sorted.slice(selected.length));
  const blocked = unresolved.filter((t) => t.dependencies.length > 0);
  return { ...session, queue: { ...session.queue, pending, blocked, active } };
};

export const completeTask = (session: RuntimeExecutionSession, taskId: string, passedVerification: boolean): RuntimeExecutionSession => {
  const task = session.queue.active.find((t) => t.id === taskId);
  if (!task) return session;
  const without = session.queue.active.filter((t) => t.id !== taskId);
  if (!passedVerification) {
    const retried: RuntimeTask = { ...task, retries: task.retries + 1, state: task.retries + 1 >= 3 ? "ESCALATED" : "WAITING" };
    return retried.state === "ESCALATED"
      ? { ...session, state: "ESCALATED", queue: { ...session.queue, active: without, blocked: [...session.queue.blocked, retried] } }
      : { ...session, queue: { ...session.queue, active: without, pending: [...session.queue.pending, retried] } };
  }
  return { ...session, queue: { ...session.queue, active: without, completed: [...session.queue.completed, { ...task, state: "COMPLETED" }] } };
};

export const assignAgents = (session: RuntimeExecutionSession): RuntimeExecutionSession => {
  const agents = session.agents.map((agent) => {
    if (agent.activeTask) return agent;
    const next = session.queue.active.find((task) => !session.agents.some((a) => a.activeTask === task.id));
    if (!next) return agent;
    return { ...agent, activeTask: next.id, workload: agent.workload + 1, executionHistory: [...agent.executionHistory, next.id] };
  });
  return { ...session, agents };
};
