import type { RuntimeTask } from "@tst-autonomous/runtime-fabric";

const baseTasks = (): RuntimeTask[] => [
  { id: "t1", label: "interpret", dependencies: [], priority: 3, approvalRequired: false, verificationRequired: true, retries: 0, state: "WAITING" },
  { id: "t2", label: "plan", dependencies: ["t1"], priority: 2, approvalRequired: true, verificationRequired: true, retries: 0, state: "WAITING" },
  { id: "t3", label: "execute", dependencies: ["t2"], priority: 1, approvalRequired: false, verificationRequired: true, retries: 0, state: "WAITING" }
];

export const demoScenarios = {
  successfulAutonomousBuild: () => baseTasks(),
  validationFailureRecovery: () => baseTasks(),
  firewallBlockRecovery: () => baseTasks(),
  escalationFlow: () => baseTasks(),
  retryOverflow: () => baseTasks(),
  evolutionProposalGeneration: () => baseTasks(),
  loopPreventionSuccess: () => baseTasks(),
  governanceInterruption: () => baseTasks()
};
