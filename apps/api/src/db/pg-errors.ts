/** Postgres error code for a unique-constraint violation (23505). */
const UNIQUE_VIOLATION_CODE = "23505";

/**
 * True if `error` is a `pg` driver error for a unique-constraint violation.
 * Needed because a check-then-insert (e.g. "does this email exist?" then
 * "insert it") is a real TOCTOU race under concurrent requests -- the
 * database's own unique constraint is the actual guarantee; this just lets
 * callers translate that guarantee's failure into a domain-appropriate error.
 */
export const isUniqueViolation = (error: unknown): boolean =>
  typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === UNIQUE_VIOLATION_CODE;
