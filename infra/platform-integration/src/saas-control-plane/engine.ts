import type {
  AccessAction,
  AccessPolicy,
  AttributePolicy,
  BillingAccount,
  DataResidencyPolicy,
  Project,
  QuotaPolicy,
  RoleBinding,
  TenantAuditLog,
  TenantAuditRecord,
  TenantBoundary,
  UsageMeter
} from "./types.js";

export const verifyTenantBoundary = (request: TenantBoundary, resource: TenantBoundary): boolean =>
  request.tenantId === resource.tenantId && request.organizationId === resource.organizationId && request.projectId === resource.projectId;

export const evaluateAccessPolicy = (
  roleBinding: RoleBinding,
  policies: AccessPolicy[],
  action: AccessAction
): { allowed: boolean; reason: string } => {
  const policy = policies.find(
    (candidate) =>
      candidate.tenantId === roleBinding.tenantId &&
      candidate.organizationId === roleBinding.organizationId &&
      candidate.role === roleBinding.role
  );
  if (!policy) return { allowed: false, reason: "access_policy_denied" };
  return policy.allowedActions.includes(action)
    ? { allowed: true, reason: "access_policy_evaluated" }
    : { allowed: false, reason: "access_policy_denied" };
};

export const enforceAttributePolicy = (attributes: Record<string, string>, policies: AttributePolicy[]): boolean =>
  policies.every((policy) => {
    const value = attributes[policy.key];
    return typeof value === "string" && policy.allowedValues.includes(value);
  });

export const checkQuota = (meter: UsageMeter, quota: QuotaPolicy): { allowed: boolean; remaining: number } => {
  const remaining = quota.maxUnits - meter.consumedUnits;
  return { allowed: remaining >= 0, remaining };
};

export const recordUsage = (meter: UsageMeter, units: number, timestamp: string): UsageMeter => ({
  ...meter,
  consumedUnits: meter.consumedUnits + units,
  updatedAt: timestamp
});

export const recordBillingUsage = (account: BillingAccount, units: number): BillingAccount => ({
  ...account,
  usageUnitsBilled: account.usageUnitsBilled + units
});

export const verifyProjectScope = (project: Project, repoPath: string): boolean => project.repoScope.some((scope) => repoPath.startsWith(scope));

export const verifyDataResidency = (policy: DataResidencyPolicy, region: string): boolean => policy.allowedRegions.includes(region);

export const appendAuditRecord = (log: TenantAuditLog, record: TenantAuditRecord): TenantAuditLog => ({ records: [...log.records, record] });

export const isPolicyChangeAllowed = (role: RoleBinding["role"]): boolean => role === "owner" || role === "admin";
