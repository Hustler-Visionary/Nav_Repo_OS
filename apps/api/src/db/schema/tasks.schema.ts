import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users.schema.js";

export const tasksTable = pgTable(
  "tasks",
  {
    id: uuid().defaultRandom().primaryKey(),
    title: text().notNull(),
    done: boolean().notNull().default(false),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  // Every CASL ownership check in TasksService filters/queries by ownerId -- this is the one index that matters here.
  (t) => [index("tasks_owner_id_idx").on(t.ownerId)]
);
