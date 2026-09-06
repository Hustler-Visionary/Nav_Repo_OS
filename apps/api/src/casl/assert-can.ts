import { ForbiddenException } from "@nestjs/common";
import { ForbiddenError } from "@casl/ability";
import type { Action } from "./action.enum.js";
import type { AppAbility, Subjects } from "./casl-ability.factory.js";

/**
 * Runs a CASL instance-level check and re-throws as Nest's ForbiddenException
 * (403, extensions.code "FORBIDDEN") instead of letting @casl/ability's own
 * ForbiddenError escape as an unhandled exception -- which Nest's default
 * filter would otherwise report as a 500 INTERNAL_SERVER_ERROR, hiding a
 * routine authorization denial behind what looks like a server bug.
 */
export const assertCan = (ability: AppAbility, action: Action, subject: Subjects): void => {
  try {
    ForbiddenError.from(ability).throwUnlessCan(action, subject);
  } catch (error) {
    if (error instanceof ForbiddenError) throw new ForbiddenException(error.message);
    throw error;
  }
};
