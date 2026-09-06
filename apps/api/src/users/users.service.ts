import { ConflictException, Inject, Injectable } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { isUniqueViolation } from "../db/pg-errors.js";
import type { UserRecord } from "./entities/user.entity.js";
import { Role } from "./models/role.enum.js";
import { USERS_REPOSITORY } from "./users.tokens.js";
import type { UsersRepository } from "./users.repository.js";

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(@Inject(USERS_REPOSITORY) private readonly repository: UsersRepository) {}

  findByEmail(email: string): Promise<UserRecord | null> {
    return this.repository.findByEmail(email);
  }

  findById(id: string): Promise<UserRecord | null> {
    return this.repository.findById(id);
  }

  /**
   * Self-registration always creates a plain USER (least privilege); admins
   * are seeded explicitly, see UsersModule.onModuleInit. The findByEmail
   * pre-check is check-then-act (two concurrent registrations for the same
   * email can both pass it), so the unique constraint on users.email is the
   * real guarantee -- a violation of it is caught here and translated to
   * the same ConflictException the pre-check gives for the common case.
   */
  async create(email: string, password: string, roles: Role[] = [Role.USER]): Promise<UserRecord> {
    const existing = await this.repository.findByEmail(email);
    if (existing) throw new ConflictException("email already registered");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    try {
      return await this.repository.create({ email, passwordHash, roles });
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException("email already registered");
      throw error;
    }
  }

  async verifyPassword(user: UserRecord, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
