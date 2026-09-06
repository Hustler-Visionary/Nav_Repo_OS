import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service.js";
import { GqlAuthGuard } from "./jwt-auth.guard.js";
import { AuthPayload } from "./dto/auth-payload.object.js";
import { LoginInput, loginSchema } from "./dto/login.input.js";
import { CreateUserInput, createUserSchema } from "../users/dto/create-user.input.js";
import { User } from "../users/entities/user.entity.js";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "./jwt.strategy.js";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  register(@Args("input", new ZodValidationPipe(createUserSchema)) input: CreateUserInput): Promise<AuthPayload> {
    return this.authService.register(input.email, input.password);
  }

  @Mutation(() => AuthPayload)
  async login(@Args("input", new ZodValidationPipe(loginSchema)) input: LoginInput): Promise<AuthPayload> {
    const user = await this.authService.validateCredentials(input.email, input.password);
    return this.authService.login(user);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): User {
    return user;
  }
}
