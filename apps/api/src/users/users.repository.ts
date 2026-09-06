import type { UserRecord } from "./entities/user.entity.js";
import type { Role } from "./models/role.enum.js";

export type NewUserRecord = { email: string; passwordHash: string; roles: Role[] };

/**
 * Seam for swapping the persistence layer without touching UsersService or
 * anything above it. Backed by Postgres/Drizzle (see DrizzleUsersRepository).
 */
export interface UsersRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(user: NewUserRecord): Promise<UserRecord>;
}
