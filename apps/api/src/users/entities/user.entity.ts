import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Role } from "../models/role.enum.js";

/** GraphQL-facing shape. Never includes passwordHash -- that stays on the internal record only. */
@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field(() => [Role])
  roles!: Role[];
}

/** Internal record kept by UsersRepository -- includes the credential, never returned from a resolver. */
export type UserRecord = User & { passwordHash: string };
