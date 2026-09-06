import { Field, ID, InputType } from "@nestjs/graphql";
import { z } from "zod";

@InputType()
export class UpdateTaskInput {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  done?: boolean;
}

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(200).optional(),
  done: z.boolean().optional()
});
