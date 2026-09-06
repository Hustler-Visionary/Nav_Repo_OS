import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service.js";
import type { User, UserRecord } from "../users/entities/user.entity.js";
import type { JwtPayload } from "./jwt.strategy.js";

const toPublicUser = (record: UserRecord): User => ({ id: record.id, email: record.email, roles: record.roles });

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateCredentials(email: string, password: string): Promise<User> {
    const record = await this.usersService.findByEmail(email);
    // Same error for "no such user" and "wrong password" -- never reveal which one it was.
    if (!record || !(await this.usersService.verifyPassword(record, password))) {
      throw new UnauthorizedException("invalid credentials");
    }
    return toPublicUser(record);
  }

  async register(email: string, password: string): Promise<{ accessToken: string; user: User }> {
    const record = await this.usersService.create(email, password);
    return this.issueToken(toPublicUser(record));
  }

  async login(user: User): Promise<{ accessToken: string; user: User }> {
    return this.issueToken(user);
  }

  private issueToken(user: User): { accessToken: string; user: User } {
    const payload: JwtPayload = { sub: user.id, email: user.email, roles: user.roles };
    return { accessToken: this.jwtService.sign(payload), user };
  }
}
