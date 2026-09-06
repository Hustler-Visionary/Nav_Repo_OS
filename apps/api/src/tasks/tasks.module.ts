import { Module } from "@nestjs/common";
import { CaslModule } from "../casl/casl.module.js";
import { TasksRepository } from "./tasks.repository.js";
import { TasksService } from "./tasks.service.js";
import { TasksResolver } from "./tasks.resolver.js";

@Module({
  imports: [CaslModule],
  providers: [TasksRepository, TasksService, TasksResolver]
})
export class TasksModule {}
