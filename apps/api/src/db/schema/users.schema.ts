import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { Role } from "../../users/models/role.enum.js";

/** Reuses the GraphQL Role enum's own members as the Postgres enum's values -- one source of truth, never two lists to keep in sync. */
export const roleEnum = pgEnum("role", [Role.ADMIN, Role.USER]);

export const usersTable = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  roles: roleEnum().array().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
