import { Field, InputType } from "@nestjs/graphql";
import { z } from "zod";

@InputType()
export class CreateTaskInput {
  @Field()
  title!: string;
}

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200)
});
