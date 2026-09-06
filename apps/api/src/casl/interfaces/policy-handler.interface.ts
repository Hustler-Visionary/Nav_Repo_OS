import type { AppAbility } from "../casl-ability.factory.js";

export type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export interface PolicyHandlerObject {
  handle(ability: AppAbility): boolean;
}

export type PolicyHandler = PolicyHandlerObject | PolicyHandlerCallback;
