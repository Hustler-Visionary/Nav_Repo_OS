import { createHash } from "node:crypto";
import type {
  AgentDebateSession,
  CognitiveDecision,
  CognitiveKernel,
  CognitiveMemory,
  CognitiveRollback,
  ConfidenceEvolution,
  ConflictResolution,
  DecisionRationale,
  GovernedSelfCorrection,
  PlanningFrame,
  ReasoningCheckpoint,
  StrategicObjective
} from "./types.js";

const hash = (value: string): string => createHash("sha256").update(value).digest("hex");

export const initializeCognitiveKernel = (id: string): CognitiveKernel => ({
  id,
  semanticFirewallActive: true,
  memory: { decisions: [], checkpoints: [] }
});

export const generatePlanningFrame = (objectiveId: string, steps: string[], assumptions: string[]): PlanningFrame => ({
  id: `plan-${objectiveId}`,
  objectiveId,
  steps,
  assumptions
});

export const validateRationale = (rationale: DecisionRationale): boolean => rationale.summary.trim().length > 0;

export const createDecision = (
  objectiveId: string,
  chosenAction: string,
  rationale: DecisionRationale,
  confidence: number
): { valid: boolean; decision?: CognitiveDecision } => {
  if (!validateRationale(rationale)) return { valid: false };
  return {
    valid: true,
    decision: { id: `decision-${objectiveId}-${chosenAction}`, objectiveId, chosenAction, rationale, confidence }
  };
};

export const evolveConfidence = (previous: number, current: number, evidenceProvided: boolean, reason: string): ConfidenceEvolution => ({
  previous,
  current: evidenceProvided || current <= previous ? current : previous,
  reason,
  evidenceProvided
});

export const reprioritizeObjective = (objective: StrategicObjective, priority: number, governanceApproved: boolean): StrategicObjective =>
  governanceApproved ? { ...objective, priority } : objective;

export const reconcileConflict = (objectiveA: StrategicObjective, objectiveB: StrategicObjective): ConflictResolution => ({
  objectiveA: objectiveA.id,
  objectiveB: objectiveB.id,
  reconciledPriority: Math.max(objectiveA.priority, objectiveB.priority),
  rationale: "higher priority retained under governance"
});

export const startDebateSession = (id: string, objectiveId: string): AgentDebateSession => ({ id, objectiveId, arguments: [] });

export const recordDebateArgument = (session: AgentDebateSession, agentId: string, stance: "pro" | "con", content: string): AgentDebateSession => ({
  ...session,
  arguments: [...session.arguments, { agentId, stance, content }]
});

export const resolveDebate = (session: AgentDebateSession, summary: string): AgentDebateSession => ({
  ...session,
  resolution: { summary, approvedForExecution: false }
});

export const createReasoningCheckpoint = (memory: CognitiveMemory, decisionId: string): ReasoningCheckpoint => ({
  id: `chk-${decisionId}-${memory.checkpoints.length + 1}`,
  decisionId,
  memoryHash: hash(JSON.stringify(memory))
});

export const applySelfCorrection = (
  memory: CognitiveMemory,
  correction: GovernedSelfCorrection
): { ok: boolean; rollback: CognitiveRollback } => {
  const exists = memory.checkpoints.some((checkpoint) => checkpoint.id === correction.checkpointId);
  return { ok: exists, rollback: { checkpointId: correction.checkpointId, applied: exists } };
};

export const replayReasoningDeterministic = (decisions: CognitiveDecision[]): string[] =>
  [...decisions].map((decision) => `${decision.id}:${decision.chosenAction}:${decision.confidence}`).sort();

export const semanticFirewallSurvivesCognition = (kernel: CognitiveKernel): boolean => kernel.semanticFirewallActive;
