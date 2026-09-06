import { Logger, Module, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DbModule } from "../db/db.module.js";
import { Role } from "./models/role.enum.js";
import { DrizzleUsersRepository } from "./drizzle-users.repository.js";
import { USERS_REPOSITORY } from "./users.tokens.js";
import { UsersService } from "./users.service.js";
import type { Env } from "../config/env.schema.js";

@Module({
  imports: [DbModule],
  providers: [{ provide: USERS_REPOSITORY, useClass: DrizzleUsersRepository }, UsersService],
  exports: [UsersService]
})
export class UsersModule implements OnModuleInit {
  private readonly logger = new Logger(UsersModule.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService<Env, true>
  ) {}

  /** Applies the opt-in ADMIN seed (SEED_ADMIN_EMAIL/PASSWORD) exactly once, idempotently, if configured. */
  async onModuleInit(): Promise<void> {
    const email = this.config.get("SEED_ADMIN_EMAIL", { infer: true });
    const password = this.config.get("SEED_ADMIN_PASSWORD", { infer: true });
    if (!email || !password) return;

    const existing = await this.usersService.findByEmail(email);
    if (existing) return;

    await this.usersService.create(email, password, [Role.ADMIN]);
    this.logger.log(`Seeded ADMIN account for ${email}`);
  }
}
