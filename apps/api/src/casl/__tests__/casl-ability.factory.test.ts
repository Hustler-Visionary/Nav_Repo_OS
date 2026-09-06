import test from "node:test";
import assert from "node:assert/strict";
import { CaslAbilityFactory } from "../casl-ability.factory.js";
import { Action } from "../action.enum.js";
import { Role } from "../../users/models/role.enum.js";
import { Task } from "../../tasks/entities/task.entity.js";
import type { AuthenticatedUser } from "../../auth/jwt.strategy.js";

const factory = new CaslAbilityFactory();

const admin: AuthenticatedUser = { id: "admin-1", email: "admin@example.com", roles: [Role.ADMIN] };
const owner: AuthenticatedUser = { id: "user-1", email: "owner@example.com", roles: [Role.USER] };
const stranger: AuthenticatedUser = { id: "user-2", email: "stranger@example.com", roles: [Role.USER] };

const ownedTask = new Task({ id: "task-1", title: "mine", done: false, ownerId: owner.id });

test("USER can create tasks (class-level check)", () => {
  const ability = factory.createForUser(owner);
  assert.equal(ability.can(Action.Create, Task), true);
});

test("USER can read/update/delete their own task", () => {
  const ability = factory.createForUser(owner);
  assert.equal(ability.can(Action.Read, ownedTask), true);
  assert.equal(ability.can(Action.Update, ownedTask), true);
  assert.equal(ability.can(Action.Delete, ownedTask), true);
});

test("USER cannot read/update/delete someone else's task", () => {
  const ability = factory.createForUser(stranger);
  assert.equal(ability.can(Action.Read, ownedTask), false);
  assert.equal(ability.can(Action.Update, ownedTask), false);
  assert.equal(ability.can(Action.Delete, ownedTask), false);
});

test("ADMIN bypasses ownership entirely", () => {
  const ability = factory.createForUser(admin);
  assert.equal(ability.can(Action.Read, ownedTask), true);
  assert.equal(ability.can(Action.Update, ownedTask), true);
  assert.equal(ability.can(Action.Delete, ownedTask), true);
  assert.equal(ability.can(Action.Create, Task), true);
});
