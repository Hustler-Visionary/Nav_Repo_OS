import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { validateEnv } from "../config/env.schema.js";

/**
 * Standalone migration runner (`pnpm db:migrate`), deliberately outside the
 * Nest module graph and never invoked from main.ts. Running migrations as
 * part of every app boot races when multiple replicas start concurrently;
 * this is meant to run once, as its own deploy/CI step, before the app
 * (re)starts -- the same shape a Kubernetes init container or a migration
 * Job would take later.
 */
const run = async (): Promise<void> => {
  const env = validateEnv(process.env);
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const db = drizzle(pool);

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete.");

  await pool.end();
};

run().catch((error: unknown) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
