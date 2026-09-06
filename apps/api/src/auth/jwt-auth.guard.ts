import { Injectable, type ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";

/** Same passport-jwt strategy as REST, adapted to pull the request out of GraphQL's execution context instead of HTTP's. */
@Injectable()
export class GqlAuthGuard extends AuthGuard("jwt") {
  override getRequest(context: ExecutionContext) {
    return GqlExecutionContext.create(context).getContext().req;
  }
}
