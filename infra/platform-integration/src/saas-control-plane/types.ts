export type Tenant = {
  id: string;
  name: string;
  ownerUserId: string;
  residencyRegion: string;
  status: "active" | "suspended" | "deleting";
};

export type Organization = {
  id: string;
  tenantId: string;
  name: string;
};

export type Project = {
  id: string;
  tenantId: string;
  organizationId: string;
  name: string;
  repoScope: string[];
};

export type Workspace = {
  id: string;
  tenantId: string;
  organizationId: string;
  projectId: string;
  name: string;
};

export type TenantBoundary = {
  tenantId: string;
  organizationId: string;
  projectId: string;
};

export type AccessAction = "read" | "propose" | "apply" | "admin_policy";

export type AccessPolicy = {
  tenantId: string;
  organizationId: string;
  role: "owner" | "admin" | "maintainer" | "viewer";
  allowedActions: AccessAction[];
};

export type RoleBinding = {
  userId: string;
  tenantId: string;
  organizationId: string;
  projectId?: string;
  role: AccessPolicy["role"];
};

export type AttributePolicy = {
  key: "environment" | "dataClassification" | "executionMode";
  allowedValues: string[];
};

export type UsageMeter = {
  tenantId: string;
  projectId: string;
  consumedUnits: number;
  updatedAt: string;
};

export type QuotaPolicy = {
  tenantId: string;
  projectId: string;
  maxUnits: number;
};

export type BillingAccount = {
  id: string;
  tenantId: string;
  currency: "USD";
  usageUnitsBilled: number;
};

export type TenantAuditRecord = {
  id: string;
  tenantId: string;
  organizationId: string;
  projectId: string;
  actorId: string;
  action: string;
  timestamp: string;
  immutableHash: string;
};

export type TenantAuditLog = {
  records: readonly TenantAuditRecord[];
};

export type DataResidencyPolicy = {
  tenantId: string;
  allowedRegions: string[];
};
