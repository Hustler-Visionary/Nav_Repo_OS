import type { ExecutionRoute } from "../graph-orchestration/types.js";

export type RouteInput = { id: string; risk: number; confidence: number; retries: number; loopRisk: number; withinApprovedScope: boolean };

export const evaluateRoute = (input: RouteInput): number => {
  const riskWeight = (1 - input.risk) * 0.35;
  const confidenceWeight = input.confidence * 0.4;
  const retryPenalty = input.retries * 0.1;
  const loopPenalty = input.loopRisk * 0.2;
  return riskWeight + confidenceWeight - retryPenalty - loopPenalty;
};

export const rejectUnsafeRoute = (input: RouteInput, escalationThreshold: number): { rejected: boolean; reason?: string } => {
  if (!input.withinApprovedScope) return { rejected: true, reason: "out of approved scope" };
  if (input.confidence < 0.5) return { rejected: true, reason: "low confidence" };
  if (input.retries >= escalationThreshold) return { rejected: true, reason: "retry threshold reached" };
  if (input.loopRisk > 0.8) return { rejected: true, reason: "loop risk too high" };
  return { rejected: false };
};

export const selectBestRoute = (inputs: RouteInput[]): ExecutionRoute | undefined => {
  const ranked = inputs
    .map((input) => {
      const rejection = rejectUnsafeRoute(input, 3);
      const base = {
        id: input.id,
        nodeIds: [input.id],
        score: evaluateRoute(input),
        rejected: rejection.rejected
      };
      return rejection.reason ? { ...base, rejectionReason: rejection.reason } : base;
    })
    .filter((route) => !route.rejected)
    .sort((a, b) => b.score - a.score);

  return ranked[0];
};
