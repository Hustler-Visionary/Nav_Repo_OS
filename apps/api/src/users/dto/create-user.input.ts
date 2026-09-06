import { Field, InputType } from "@nestjs/graphql";
import { z } from "zod";

@InputType()
export class CreateUserInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "password must be at least 8 characters")
});
