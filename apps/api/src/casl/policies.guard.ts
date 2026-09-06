import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Reflector } from "@nestjs/core";
import { CHECK_POLICIES_KEY } from "./decorators/check-policies.decorator.js";
import { CaslAbilityFactory } from "./casl-ability.factory.js";
import type { PolicyHandler } from "./interfaces/policy-handler.interface.js";
import type { AppAbility } from "./casl-ability.factory.js";
import type { AuthenticatedUser } from "../auth/jwt.strategy.js";

const execute = (handler: PolicyHandler, ability: AppAbility): boolean =>
  typeof handler === "function" ? handler(ability) : handler.handle(ability);

/** Must run after GqlAuthGuard (needs req.user) and typically after RolesGuard for coarse gating first. */
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly abilityFactory: CaslAbilityFactory
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const handlers = this.reflector.getAllAndOverride<PolicyHandler[] | undefined>(CHECK_POLICIES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!handlers || handlers.length === 0) return true;

    const req = GqlExecutionContext.create(context).getContext().req;
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) return false;

    const ability = this.abilityFactory.createForUser(user);
    const allowed = handlers.every((handler) => execute(handler, ability));
    if (!allowed) throw new ForbiddenException("insufficient permissions for this resource");
    return true;
  }
}
