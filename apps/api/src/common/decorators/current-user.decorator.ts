import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { AuthenticatedUser } from "../../auth/jwt.strategy.js";

/** Pulls the JWT-authenticated user (set by JwtStrategy.validate) off the GraphQL request. */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedUser => {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext().req.user as AuthenticatedUser;
});
