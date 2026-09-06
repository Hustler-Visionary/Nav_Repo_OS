import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Action } from "../casl/action.enum.js";
import { CaslAbilityFactory } from "../casl/casl-ability.factory.js";
import { assertCan } from "../casl/assert-can.js";
import { Task } from "./entities/task.entity.js";
import { TASKS_REPOSITORY } from "./tasks.tokens.js";
import type { TasksRepository } from "./tasks.repository.js";
import type { AuthenticatedUser } from "../auth/jwt.strategy.js";

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASKS_REPOSITORY) private readonly repository: TasksRepository,
    private readonly abilityFactory: CaslAbilityFactory
  ) {}

  /** List-level filtering: silently drop what the caller can't read, rather than throwing on a bulk query. */
  async findAll(user: AuthenticatedUser): Promise<Task[]> {
    const ability = this.abilityFactory.createForUser(user);
    const tasks = await this.repository.findAll();
    return tasks.filter((task) => ability.can(Action.Read, task));
  }

  async findOne(id: string, user: AuthenticatedUser): Promise<Task> {
    const task = await this.repository.findById(id);
    if (!task) throw new NotFoundException(`task ${id} not found`);
    assertCan(this.abilityFactory.createForUser(user), Action.Read, task);
    return task;
  }

  async create(title: string, user: AuthenticatedUser): Promise<Task> {
    // Class-level check: creating doesn't need an existing instance to test conditions against.
    assertCan(this.abilityFactory.createForUser(user), Action.Create, Task);
    return this.repository.create(title, user.id);
  }

  async update(id: string, patch: { title?: string; done?: boolean }, user: AuthenticatedUser): Promise<Task> {
    const task = await this.findOne(id, user);
    assertCan(this.abilityFactory.createForUser(user), Action.Update, task);
    return this.repository.update(new Task({ ...task, ...patch }));
  }

  async remove(id: string, user: AuthenticatedUser): Promise<boolean> {
    const task = await this.findOne(id, user);
    assertCan(this.abilityFactory.createForUser(user), Action.Delete, task);
    await this.repository.remove(id);
    return true;
  }
}
