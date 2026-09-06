import { z } from "zod";

/**
 * Fails fast on boot rather than falling back to an insecure default --
 * JWT_SECRET in particular must never have a built-in fallback value.
 */
export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_EXPIRES_IN: z.string().default("15m"),
    /** Comma-separated list of allowed CORS origins. Empty in production means no cross-origin access. */
    CORS_ORIGIN: z.string().optional(),
    /** Opt-in ADMIN seed applied once at boot -- never a built-in default credential. Set both or neither. */
    SEED_ADMIN_EMAIL: z.string().email().optional(),
    SEED_ADMIN_PASSWORD: z.string().min(8).optional()
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
