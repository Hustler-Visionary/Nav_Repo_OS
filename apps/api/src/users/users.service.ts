import { ConflictException, Inject, Injectable } from "@nestjs/common";
import bcrypt from "bcryptjs";
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

  /** Self-registration always creates a plain USER (least privilege); admins are seeded explicitly, see UsersModule.onModuleInit. */
  async create(email: string, password: string, roles: Role[] = [Role.USER]): Promise<UserRecord> {
    const existing = await this.repository.findByEmail(email);
    if (existing) throw new ConflictException("email already registered");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    return this.repository.create({ email, passwordHash, roles });
  }

  async verifyPassword(user: UserRecord, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
