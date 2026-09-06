import { Injectable } from "@nestjs/common";
import { AbilityBuilder, createMongoAbility, type ExtractSubjectType, type InferSubjects, type MongoAbility } from "@casl/ability";
import { Action } from "./action.enum.js";
import { Role } from "../users/models/role.enum.js";
import { Task } from "../tasks/entities/task.entity.js";
import type { AuthenticatedUser } from "../auth/jwt.strategy.js";

export type Subjects = InferSubjects<typeof Task> | "all";
export type AppAbility = MongoAbility<[Action, Subjects]>;

/**
 * The single source of truth for what each role can do. RBAC picks the
 * branch (ADMIN vs USER); CASL expresses what that branch can actually act
 * on, including per-record ownership conditions plain role checks can't.
 */
@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthenticatedUser): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.roles.includes(Role.ADMIN)) {
      can(Action.Manage, "all");
    } else {
      can(Action.Create, Task);
      can(Action.Read, Task, { ownerId: user.id });
      can(Action.Update, Task, { ownerId: user.id });
      can(Action.Delete, Task, { ownerId: user.id });
    }

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>
    });
  }
}
