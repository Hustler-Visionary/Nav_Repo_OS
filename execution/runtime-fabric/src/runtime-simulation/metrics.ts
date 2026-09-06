import type { RuntimeExecutionSession } from "./types.js";

export type RuntimeMetrics = {
  executionThroughput: number;
  avgVerificationLatency: number;
  retryFrequency: number;
  escalationFrequency: number;
  agentUtilization: number;
  queuePressure: number;
  governanceInterruptionRate: number;
  traceThroughput: number;
  replaySpeed: number;
};

export const calculateRuntimeMetrics = (session: RuntimeExecutionSession, traceCount: number): RuntimeMetrics => {
  const totalTasks = session.queue.pending.length + session.queue.active.length + session.queue.completed.length;
  const retries = session.queue.pending.reduce((acc, t) => acc + t.retries, 0) + session.queue.blocked.reduce((acc, t) => acc + t.retries, 0);
  const escalations = session.queue.blocked.filter((t) => t.state === "ESCALATED").length;
  const busyAgents = session.agents.filter((a) => a.activeTask).length;
  return {
    executionThroughput: session.queue.completed.length,
    avgVerificationLatency: session.queue.completed.length === 0 ? 0 : 1,
    retryFrequency: totalTasks === 0 ? 0 : retries / totalTasks,
    escalationFrequency: totalTasks === 0 ? 0 : escalations / totalTasks,
    agentUtilization: session.agents.length === 0 ? 0 : busyAgents / session.agents.length,
    queuePressure: session.queue.pending.length,
    governanceInterruptionRate: session.governancePaused ? 1 : 0,
    traceThroughput: traceCount,
    replaySpeed: 1
  };
};
