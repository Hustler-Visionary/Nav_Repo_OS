import { registerEnumType } from "@nestjs/graphql";

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER"
}

registerEnumType(Role, { name: "Role", description: "Roles this API's RBAC/CASL layer distinguishes between." });
