import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DATABASE_CONNECTION, type Database } from "../db/db.tokens.js";
import { tasksTable } from "../db/schema/index.js";
import { Task } from "./entities/task.entity.js";
import type { TasksRepository } from "./tasks.repository.js";

@Injectable()
export class DrizzleTasksRepository implements TasksRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findAll(): Promise<Task[]> {
    const rows = await this.db.select().from(tasksTable);
    return rows.map((row) => new Task(row));
  }

  async findById(id: string): Promise<Task | null> {
    const [row] = await this.db.select().from(tasksTable).where(eq(tasksTable.id, id)).limit(1);
    return row ? new Task(row) : null;
  }

  async create(title: string, ownerId: string): Promise<Task> {
    const [row] = await this.db.insert(tasksTable).values({ title, ownerId, done: false }).returning();
    if (!row) throw new Error("insert into tasks returned no row");
    return new Task(row);
  }

  async update(task: Task): Promise<Task> {
    const [row] = await this.db
      .update(tasksTable)
      .set({ title: task.title, done: task.done })
      .where(eq(tasksTable.id, task.id))
      .returning();
    if (!row) throw new Error(`task ${task.id} not found during update`);
    return new Task(row);
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(tasksTable).where(eq(tasksTable.id, id));
  }
}
