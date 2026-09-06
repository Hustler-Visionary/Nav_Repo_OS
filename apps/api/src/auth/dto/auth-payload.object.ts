import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "../../users/entities/user.entity.js";

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken!: string;

  @Field(() => User)
  user!: User;
}
