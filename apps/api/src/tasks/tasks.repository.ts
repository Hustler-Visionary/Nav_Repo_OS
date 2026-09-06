import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { Task } from "./entities/task.entity.js";

/** In-memory for this first cut, same repository seam as UsersRepository -- swap for a real store without touching TasksService's authorization logic. */
@Injectable()
export class TasksRepository {
  private readonly byId = new Map<string, Task>();

  findAll(): Task[] {
    return [...this.byId.values()];
  }

  findById(id: string): Task | null {
    return this.byId.get(id) ?? null;
  }

  create(title: string, ownerId: string): Task {
    const task = new Task({ id: randomUUID(), title, done: false, ownerId });
    this.byId.set(task.id, task);
    return task;
  }

  update(task: Task): Task {
    this.byId.set(task.id, task);
    return task;
  }

  remove(id: string): void {
    this.byId.delete(id);
  }
}
