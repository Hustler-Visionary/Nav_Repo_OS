import type {
  AuditEvidence,
  ComplianceControl,
  DataClassificationPolicy,
  IncidentResponsePlan,
  LegalHoldPolicy,
  PiiDetection,
  RetentionPolicy,
  SecretLeakDetection,
  SecurityException,
  SecurityPosture,
  TrustCenterRecord
} from "./types.js";

export const evaluateSecurityPosture = (tenantId: string, controls: ComplianceControl[], incidentOpen: boolean): SecurityPosture => {
  const controlsPassing = controls.filter((control) => control.passed).length;
  const controlsTotal = controls.length;
  const score = controlsTotal === 0 ? 0 : Math.round((controlsPassing / controlsTotal) * 100);
  return { tenantId, score, controlsPassing, controlsTotal, incidentOpen };
};

export const checkComplianceControl = (control: ComplianceControl): boolean => !control.required || control.passed;

export const recordAuditEvidence = (evidenceLog: readonly AuditEvidence[], evidence: AuditEvidence): readonly AuditEvidence[] => [...evidenceLog, { ...evidence, immutable: true }];

export const detectSecretLeak = (payload: string, policy: DataClassificationPolicy): SecretLeakDetection => {
  const matches = policy.secretPatterns.filter((pattern) => payload.includes(pattern));
  return { leaked: matches.length > 0, matches };
};

export const detectPii = (payload: string, policy: DataClassificationPolicy): PiiDetection => {
  const matches = policy.piiPatterns.filter((pattern) => payload.includes(pattern));
  return { detected: matches.length > 0, matches };
};

export const canExportPayload = (payload: string, policy: DataClassificationPolicy): { allowed: boolean; reason: string } => {
  const secret = detectSecretLeak(payload, policy);
  if (secret.leaked) return { allowed: false, reason: "secret_leak_detected" };
  const pii = detectPii(payload, policy);
  if (pii.detected) return { allowed: false, reason: "pii_detected" };
  return { allowed: true, reason: "export_allowed" };
};

export const applyRetentionPolicy = (tenantId: string, days: number, policy: RetentionPolicy): boolean =>
  policy.tenantId === tenantId && days >= policy.minDays && days <= policy.maxDays;

export const canDeleteWithLegalHold = (legalHold: LegalHoldPolicy): boolean => !legalHold.active;

export const openIncidentResponse = (tenantId: string, severity: IncidentResponsePlan["severity"]): IncidentResponsePlan => ({
  id: `incident-${tenantId}-${severity}`,
  tenantId,
  severity,
  status: "open",
  escalationRequired: severity === "high" || severity === "critical"
});

export const resolveIncidentResponse = (incident: IncidentResponsePlan): IncidentResponsePlan => ({ ...incident, status: "resolved" });

export const createTrustCenterRecord = (record: Omit<TrustCenterRecord, "sensitiveFieldsRedacted">): TrustCenterRecord => ({
  ...record,
  sensitiveFieldsRedacted: true
});

export const evaluateSecurityExceptionApproval = (
  exception: SecurityException,
  approverRole: "owner" | "admin" | "maintainer" | "viewer"
): SecurityException => {
  if (approverRole === exception.approvalRoleRequired || (exception.approvalRoleRequired === "admin" && approverRole === "owner")) {
    return { ...exception, status: "approved" };
  }
  return { ...exception, status: "rejected" };
};
