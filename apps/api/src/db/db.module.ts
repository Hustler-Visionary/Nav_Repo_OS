import { Inject, Module, type OnModuleDestroy } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.js";
import { DATABASE_CONNECTION, PG_POOL } from "./db.tokens.js";
import type { Env } from "../config/env.schema.js";

/**
 * Explicit, bounded pool settings -- never the driver's unbounded default.
 * A single Nest process should never need more than a handful of concurrent
 * connections; this leaves headroom for other replicas against the same
 * Postgres instance once this moves beyond a single local container.
 */
const POOL_MAX_CONNECTIONS = 10;
const POOL_IDLE_TIMEOUT_MS = 30_000;
const POOL_CONNECTION_TIMEOUT_MS = 5_000;

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new Pool({
          connectionString: config.get("DATABASE_URL", { infer: true }),
          max: POOL_MAX_CONNECTIONS,
          idleTimeoutMillis: POOL_IDLE_TIMEOUT_MS,
          connectionTimeoutMillis: POOL_CONNECTION_TIMEOUT_MS
        })
    },
    {
      provide: DATABASE_CONNECTION,
      inject: [PG_POOL],
      useFactory: (pool: Pool) => drizzle(pool, { schema })
    }
  ],
  exports: [DATABASE_CONNECTION]
})
export class DbModule implements OnModuleDestroy {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  /** Only actually runs if the app calls enableShutdownHooks() (see main.ts) -- otherwise Nest never fires module-destroy on SIGTERM. */
  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
