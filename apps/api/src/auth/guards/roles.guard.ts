import { Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator.js";
import type { Role } from "../../users/models/role.enum.js";
import type { AuthenticatedUser } from "../jwt.strategy.js";

/**
 * Coarse-grained RBAC: does this authenticated user hold one of the roles
 * required by @Roles(...) on the handler? Must run after GqlAuthGuard so
 * req.user is already populated. For per-resource/ownership rules, see
 * PoliciesGuard (CASL) instead -- the two guards compose on the same route.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = GqlExecutionContext.create(context).getContext().req;
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) return false;

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
