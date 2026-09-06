import { Injectable, NotFoundException } from "@nestjs/common";
import { Action } from "../casl/action.enum.js";
import { CaslAbilityFactory } from "../casl/casl-ability.factory.js";
import { assertCan } from "../casl/assert-can.js";
import { Task } from "./entities/task.entity.js";
import { TasksRepository } from "./tasks.repository.js";
import type { AuthenticatedUser } from "../auth/jwt.strategy.js";

@Injectable()
export class TasksService {
  constructor(
    private readonly repository: TasksRepository,
    private readonly abilityFactory: CaslAbilityFactory
  ) {}

  /** List-level filtering: silently drop what the caller can't read, rather than throwing on a bulk query. */
  findAll(user: AuthenticatedUser): Task[] {
    const ability = this.abilityFactory.createForUser(user);
    return this.repository.findAll().filter((task) => ability.can(Action.Read, task));
  }

  findOne(id: string, user: AuthenticatedUser): Task {
    const task = this.repository.findById(id);
    if (!task) throw new NotFoundException(`task ${id} not found`);
    assertCan(this.abilityFactory.createForUser(user), Action.Read, task);
    return task;
  }

  create(title: string, user: AuthenticatedUser): Task {
    // Class-level check: creating doesn't need an existing instance to test conditions against.
    assertCan(this.abilityFactory.createForUser(user), Action.Create, Task);
    return this.repository.create(title, user.id);
  }

  update(id: string, patch: { title?: string; done?: boolean }, user: AuthenticatedUser): Task {
    const task = this.findOne(id, user);
    assertCan(this.abilityFactory.createForUser(user), Action.Update, task);
    return this.repository.update(new Task({ ...task, ...patch }));
  }

  remove(id: string, user: AuthenticatedUser): boolean {
    const task = this.findOne(id, user);
    assertCan(this.abilityFactory.createForUser(user), Action.Delete, task);
    this.repository.remove(id);
    return true;
  }
}
