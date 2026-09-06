import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "./schema/index.js";

export const PG_POOL = Symbol("PG_POOL");
export const DATABASE_CONNECTION = Symbol("DATABASE_CONNECTION");

export type Database = NodePgDatabase<typeof schema>;
