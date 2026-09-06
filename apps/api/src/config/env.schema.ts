import { z } from "zod";

/**
 * Fails fast on boot rather than falling back to an insecure default --
 * JWT_SECRET in particular must never have a built-in fallback value.
 */

/**
 * An optional field left as `KEY=` in a .env file (the convention used by
 * .env.example throughout this repo) arrives as `""`, not `undefined` --
 * plain `.optional()` only special-cases `undefined`, so it would otherwise
 * fail the inner validator (e.g. `.email()`) on every unset-but-present key.
 */
const optionalEnv = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    /** Required, no built-in default -- see infra/docker/README.md for the local Postgres this points at. */
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid postgres:// connection string"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_EXPIRES_IN: z.string().default("15m"),
    /** Comma-separated list of allowed CORS origins. Empty in production means no cross-origin access. */
    CORS_ORIGIN: optionalEnv(z.string()),
    /** Opt-in ADMIN seed applied once at boot -- never a built-in default credential. Set both or neither. */
    SEED_ADMIN_EMAIL: optionalEnv(z.string().email()),
    SEED_ADMIN_PASSWORD: optionalEnv(z.string().min(8))
  })
  .refine((env) => Boolean(env.SEED_ADMIN_EMAIL) === Boolean(env.SEED_ADMIN_PASSWORD), {
    message: "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set together",
    path: ["SEED_ADMIN_EMAIL"]
  });

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (config: Record<string, unknown>): Env => {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n")}`);
  }
  return result.data;
};
