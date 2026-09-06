export type Snapshot<T> = { id: string; createdAt: string; state: T };

export const createSnapshot = <T>(id: string, state: T): Snapshot<T> => ({ id, createdAt: new Date().toISOString(), state: structuredClone(state) });
export const restoreSnapshot = <T>(snapshot: Snapshot<T>): T => structuredClone(snapshot.state);
export const compareSnapshots = <T>(a: Snapshot<T>, b: Snapshot<T>): { changed: boolean; summary: string } => {
  const left = JSON.stringify(a.state);
  const right = JSON.stringify(b.state);
  return { changed: left !== right, summary: left === right ? "No changes" : "State changed" };
};
