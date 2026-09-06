import { Module } from "@nestjs/common";
import { CaslModule } from "../casl/casl.module.js";
import { DbModule } from "../db/db.module.js";
import { DrizzleTasksRepository } from "./drizzle-tasks.repository.js";
import { TASKS_REPOSITORY } from "./tasks.tokens.js";
import { TasksService } from "./tasks.service.js";
import { TasksResolver } from "./tasks.resolver.js";

@Module({
  imports: [CaslModule, DbModule],
  providers: [{ provide: TASKS_REPOSITORY, useClass: DrizzleTasksRepository }, TasksService, TasksResolver]
})
export class TasksModule {}
