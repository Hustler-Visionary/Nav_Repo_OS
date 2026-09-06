import { randomUUID } from "node:crypto";
import type { UserRecord } from "./entities/user.entity.js";
import { Role } from "./models/role.enum.js";

export type NewUserRecord = { email: string; passwordHash: string; roles: Role[] };

/**
 * Seam for swapping in a real database (Postgres/Drizzle, per docs/STACK.md)
 * without touching UsersService or anything above it. In-memory on purpose
 * for this first cut -- no persistence claims are made anywhere else in
 * this module.
 */
export interface UsersRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(user: NewUserRecord): Promise<UserRecord>;
}

export class InMemoryUsersRepository implements UsersRepository {
  private readonly byId = new Map<string, UserRecord>();

  async findByEmail(email: string): Promise<UserRecord | null> {
    for (const user of this.byId.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.byId.get(id) ?? null;
  }

  async create(user: NewUserRecord): Promise<UserRecord> {
    const record: UserRecord = { id: randomUUID(), ...user };
    this.byId.set(record.id, record);
    return record;
  }
}
