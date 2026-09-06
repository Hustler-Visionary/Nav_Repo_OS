export type FactoryMemory = {
  workflowMemory: string[];
  failureMemory: string[];
  recoveryMemory: string[];
  governanceMemory: string[];
  evolutionMemory: string[];
  replayIndex: Record<string, number>;
};

export const createFactoryMemory = (): FactoryMemory => ({ workflowMemory: [], failureMemory: [], recoveryMemory: [], governanceMemory: [], evolutionMemory: [], replayIndex: {} });
export const indexReplay = (memory: FactoryMemory, workflowId: string, cursor: number): FactoryMemory => ({ ...memory, replayIndex: { ...memory.replayIndex, [workflowId]: cursor } });
