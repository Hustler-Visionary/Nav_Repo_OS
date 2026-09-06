export type StrategicObjective = {
  id: string;
  title: string;
  priority: number;
  status: "draft" | "active" | "blocked" | "completed";
  governanceReviewed: boolean;
};

export type GoalConstraint = {
  id: string;
  objectiveId: string;
  description: string;
};

export type GoalHierarchy = {
  rootObjectiveId: string;
  childObjectiveIds: string[];
};

export type PlanningFrame = {
  id: string;
  objectiveId: string;
  steps: string[];
  assumptions: string[];
};

export type DecisionRationale = {
  summary: string;
  evidenceRefs: string[];
};

export type CognitiveDecision = {
  id: string;
  objectiveId: string;
  chosenAction: string;
  rationale: DecisionRationale;
  confidence: number;
};

export type ConfidenceEvolution = {
  previous: number;
  current: number;
  reason: string;
  evidenceProvided: boolean;
};

export type DebateArgument = {
  agentId: string;
  stance: "pro" | "con";
  content: string;
};

export type DebateResolution = {
  summary: string;
  approvedForExecution: false;
};

export type AgentDebateSession = {
  id: string;
  objectiveId: string;
  arguments: DebateArgument[];
  resolution?: DebateResolution;
};

export type ConflictResolution = {
  objectiveA: string;
  objectiveB: string;
  reconciledPriority: number;
  rationale: string;
};

export type CognitiveMemory = {
  decisions: CognitiveDecision[];
  checkpoints: ReasoningCheckpoint[];
};

export type ReasoningCheckpoint = {
  id: string;
  decisionId: string;
  memoryHash: string;
};

export type GovernedSelfCorrection = {
  decisionId: string;
  checkpointId: string;
  correctionPlan: string;
};

export type CognitiveRollback = {
  checkpointId: string;
  applied: boolean;
};

export type PriorityEngine = {
  governed: true;
};

export type CognitiveKernel = {
  id: string;
  semanticFirewallActive: true;
  memory: CognitiveMemory;
};
