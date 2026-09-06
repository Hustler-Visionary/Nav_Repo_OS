import type { CinematicTimeline } from "../../cinematics/engine.js";

export const renderReplayTheater = (timeline: CinematicTimeline, speed: number, focus: string): string => {
  const density = timeline.beats.length;
  const escalationZones = timeline.beats.filter((b) => b.type === "shockwave").length;
  const recoveryZones = timeline.beats.filter((b) => b.type === "pulse").length;
  return `ReplayTheater\nscene:${timeline.sceneId}\nspeed:${speed}\nfocus:${focus}\nheatmap:density=${density},escalation=${escalationZones},recovery=${recoveryZones}`;
};
