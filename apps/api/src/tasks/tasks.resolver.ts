import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { z } from "zod";
import { GqlAuthGuard } from "../auth/jwt-auth.guard.js";
import { PoliciesGuard } from "../casl/policies.guard.js";
import { CheckPolicies } from "../casl/decorators/check-policies.decorator.js";
import { Action } from "../casl/action.enum.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe.js";
import { Task } from "./entities/task.entity.js";
import { CreateTaskInput, createTaskSchema } from "./dto/create-task.input.js";
import { UpdateTaskInput, updateTaskSchema } from "./dto/update-task.input.js";
import { TasksService } from "./tasks.service.js";
import type { AuthenticatedUser } from "../auth/jwt.strategy.js";

const taskIdSchema = z.string().uuid();

@Resolver(() => Task)
@UseGuards(GqlAuthGuard, PoliciesGuard)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => [Task])
  tasks(@CurrentUser() user: AuthenticatedUser): Promise<Task[]> {
    return this.tasksService.findAll(user);
  }

  @Query(() => Task)
  task(@Args("id", { type: () => ID }, new ZodValidationPipe(taskIdSchema)) id: string, @CurrentUser() user: AuthenticatedUser): Promise<Task> {
    return this.tasksService.findOne(id, user);
  }

  @Mutation(() => Task)
  @CheckPolicies((ability) => ability.can(Action.Create, Task))
  createTask(
    @Args("input", new ZodValidationPipe(createTaskSchema)) input: CreateTaskInput,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<Task> {
    return this.tasksService.create(input.title, user);
  }

  @Mutation(() => Task)
  updateTask(
    @Args("input", new ZodValidationPipe(updateTaskSchema)) input: UpdateTaskInput,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<Task> {
    const { id, ...patch } = input;
    return this.tasksService.update(id, patch, user);
  }

  @Mutation(() => Boolean)
  removeTask(
    @Args("id", { type: () => ID }, new ZodValidationPipe(taskIdSchema)) id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<boolean> {
    return this.tasksService.remove(id, user);
  }
}
