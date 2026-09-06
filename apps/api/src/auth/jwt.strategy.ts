import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../users/users.service.js";
import type { Role } from "../users/models/role.enum.js";
import type { Env } from "../config/env.schema.js";

export type JwtPayload = { sub: string; email: string; roles: Role[] };
export type AuthenticatedUser = { id: string; email: string; roles: Role[] };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService<Env, true>,
    private readonly usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get("JWT_SECRET", { infer: true })
    });
  }

  /** Re-checks the user still exists on every request rather than trusting the token payload alone -- a deleted/disabled account is rejected immediately, not just at next login. */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException("user no longer exists");
    return { id: user.id, email: user.email, roles: user.roles };
  }
}
