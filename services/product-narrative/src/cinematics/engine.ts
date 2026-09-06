export type CinematicBeat = { id: string; type: "wave" | "shockwave" | "pulse" | "scan" | "transition"; intensity: number; timestamp: number };
export type CinematicTimeline = { id: string; storylineId: string; sceneId: string; beats: CinematicBeat[]; compressed: boolean };

export const createCinematicTimeline = (id: string, storylineId: string, sceneId: string, seed = 1): CinematicTimeline => ({
  id,
  storylineId,
  sceneId,
  compressed: false,
  beats: [
    { id: `b-${seed}-1`, type: "wave", intensity: 0.6, timestamp: 0 },
    { id: `b-${seed}-2`, type: "scan", intensity: 0.4, timestamp: 1 },
    { id: `b-${seed}-3`, type: "pulse", intensity: 0.8, timestamp: 2 }
  ]
});

export const compressTimeline = (timeline: CinematicTimeline): CinematicTimeline => ({ ...timeline, compressed: true, beats: timeline.beats.filter((_, i) => i % 2 === 0) });
export const expandTimeline = (timeline: CinematicTimeline): CinematicTimeline => ({ ...timeline, compressed: false });
export const throttleAnimationFrame = (frame: number, throttle = 2): boolean => frame % throttle === 0;
