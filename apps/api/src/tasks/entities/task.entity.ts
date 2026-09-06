import { Field, ID, ObjectType } from "@nestjs/graphql";

/**
 * A plain class (not just an interface) on purpose: CaslAbilityFactory's
 * detectSubjectType relies on `instance.constructor`, which only exists on
 * real class instances -- plain object literals shaped like a Task would
 * silently fail CASL's ownership checks.
 */
@ObjectType()
export class Task {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  done!: boolean;

  @Field(() => ID)
  ownerId!: string;

  constructor(partial: Partial<Task> = {}) {
    Object.assign(this, partial);
  }
}
