export type Narrative = { id: string; chainId: string; kind: "execution" | "governance" | "recovery" | "escalation" | "replay" | "reasoning" | "milestone" | "enterprise" | "strategic" | "organization" | "resilience" | "civilization"; text: string; recoveryArcId?: string };

export const generateNarrative = (kind: Narrative["kind"], context: string, confidence: number): Narrative => ({
  id: `${kind}-${context}`,
  chainId: `chain-${context}`,
  kind,
  text: `WHY ${kind}: ${context}. Confidence=${confidence.toFixed(2)}.` + (confidence < 0.6 ? " Reroute required." : " Route accepted."),
  ...(kind === "recovery" || kind === "resilience" ? { recoveryArcId: `arc-${context}` } : {})
});
