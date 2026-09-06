export type ReplayFrame<T> = { traceId: string; state: T };

export const replayExecution = <T>(frames: ReplayFrame<T>[]): { frames: ReplayFrame<T>[]; cursor: number } => ({ frames, cursor: 0 });
export const stepForward = <T>(cursor: number, frames: ReplayFrame<T>[]): number => Math.min(cursor + 1, Math.max(frames.length - 1, 0));
export const stepBackward = (cursor: number): number => Math.max(cursor - 1, 0);
export const jumpToTrace = <T>(traceId: string, frames: ReplayFrame<T>[]): number => Math.max(0, frames.findIndex((f) => f.traceId === traceId));
export const replayFromSnapshot = <T>(snapshot: T, frames: ReplayFrame<T>[]): ReplayFrame<T>[] => [{ traceId: "snapshot", state: snapshot }, ...frames];
