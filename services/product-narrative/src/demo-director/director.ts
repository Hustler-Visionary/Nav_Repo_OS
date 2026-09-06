export type DemoScene = { id: string; name: string; focus: "execution" | "escalation" | "recovery" | "governance" | "reasoning"; pace: "slow" | "normal" | "fast" };
export type CameraFocus = { mode: "auto" | "follow"; target: string; zoom: number };

export const orchestrateScenes = (seed = 1): DemoScene[] => [
  { id: `s${seed}-1`, name: "startup", focus: "execution", pace: "normal" },
  { id: `s${seed}-2`, name: "governance", focus: "governance", pace: "slow" },
  { id: `s${seed}-3`, name: "recovery", focus: "recovery", pace: "normal" }
];

export const nextCameraFocus = (scene: DemoScene): CameraFocus => {
  if (scene.focus === "escalation") return { mode: "auto", target: "escalation", zoom: 1.4 };
  if (scene.focus === "recovery") return { mode: "follow", target: "recovery", zoom: 1.2 };
  if (scene.focus === "governance") return { mode: "auto", target: "governance", zoom: 1.3 };
  if (scene.focus === "reasoning") return { mode: "follow", target: "reasoning", zoom: 1.15 };
  return { mode: "follow", target: "execution", zoom: 1.1 };
};
