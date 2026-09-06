import type { Task } from "./entities/task.entity.js";

/**
 * Seam for swapping the persistence layer without touching TasksService's
 * authorization logic. Backed by Postgres/Drizzle (see DrizzleTasksRepository).
 */
export interface TasksRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(title: string, ownerId: string): Promise<Task>;
  update(task: Task): Promise<Task>;
  remove(id: string): Promise<void>;
}
