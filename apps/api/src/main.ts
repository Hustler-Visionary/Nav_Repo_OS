import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";
import type { Env } from "./config/env.schema.js";

const resolveCorsOrigin = (config: ConfigService<Env, true>): string[] | boolean => {
  const raw = config.get("CORS_ORIGIN", { infer: true });
  if (raw) return raw.split(",").map((origin) => origin.trim());
  // No explicit allowlist: permit the local Next.js dev origin outside production, nothing in production.
  return config.get("NODE_ENV", { infer: true }) === "production" ? [] : ["http://localhost:3000"];
};

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<Env, true>);

  // Without this, Nest never calls onModuleDestroy on SIGTERM/SIGINT --
  // DbModule's pool.end() (see src/db/db.module.ts) would never run, and a
  // container restart or `docker compose down` would drop connections
  // uncleanly instead of closing the pool first.
  app.enableShutdownHooks();

  app.enableCors({ origin: resolveCorsOrigin(config), credentials: false });

  const port = config.get("PORT", { infer: true });
  await app.listen(port);
  Logger.log(`API listening on http://localhost:${port} (GraphQL at /graphql, health at /health)`, "Bootstrap");
};

bootstrap().catch((error: unknown) => {
  Logger.error("Fatal error during bootstrap", error instanceof Error ? error.stack : String(error), "Bootstrap");
  process.exit(1);
});
