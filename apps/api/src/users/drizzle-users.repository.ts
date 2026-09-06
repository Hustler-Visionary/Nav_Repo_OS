import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DATABASE_CONNECTION, type Database } from "../db/db.tokens.js";
import { usersTable } from "../db/schema/index.js";
import type { UserRecord } from "./entities/user.entity.js";
import type { NewUserRecord, UsersRepository } from "./users.repository.js";

@Injectable()
export class DrizzleUsersRepository implements UsersRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const [row] = await this.db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    return row ?? null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const [row] = await this.db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return row ?? null;
  }

  async create(user: NewUserRecord): Promise<UserRecord> {
    const [row] = await this.db.insert(usersTable).values(user).returning();
    if (!row) throw new Error("insert into users returned no row");
    return row;
  }
}
