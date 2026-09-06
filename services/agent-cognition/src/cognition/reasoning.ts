export type ReasoningFrame = {
  routeId: string;
  whyRoute: string;
  whyBlocked: string;
  whyEscalated: string;
  whyRerouted: string;
  whyConfidenceChanged: string;
  ambiguityDetected: boolean;
};

export const generateReasoningFrame = (routeId: string, confidence: number, blocked: boolean): ReasoningFrame => ({
  routeId,
  whyRoute: "Selected due to highest safe score in approved scope",
  whyBlocked: blocked ? "Dependency unresolved or governance pause" : "Not blocked",
  whyEscalated: confidence < 0.5 ? "Confidence below threshold" : "No escalation",
  whyRerouted: blocked ? "Rerouted to alternate dependency-free path" : "No reroute",
  whyConfidenceChanged: `Confidence currently ${confidence}`,
  ambiguityDetected: confidence < 0.6
});
