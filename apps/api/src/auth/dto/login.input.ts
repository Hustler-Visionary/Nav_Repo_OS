import { Field, InputType } from "@nestjs/graphql";
import { z } from "zod";

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "password is required")
});
