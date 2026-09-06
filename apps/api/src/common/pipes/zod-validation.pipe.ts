import { BadRequestException, type PipeTransform } from "@nestjs/common";
import type { ZodSchema } from "zod";

/**
 * Validates a resolver/controller argument against a Zod schema, replacing
 * class-validator for every input in this codebase. Works identically across
 * REST and GraphQL since Nest pipes are transport-agnostic.
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
      );
    }
    return result.data;
  }
}
