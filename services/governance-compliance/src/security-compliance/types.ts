export type SecurityPosture = {
  tenantId: string;
  score: number;
  controlsPassing: number;
  controlsTotal: number;
  incidentOpen: boolean;
};

export type ComplianceFramework = "SOC2" | "ISO27001" | "GDPR" | "HIPAA_READY" | "ENTERPRISE_CUSTOM";

export type ComplianceControl = {
  id: string;
  framework: ComplianceFramework;
  name: string;
  required: boolean;
  passed: boolean;
  details: string;
};

export type AuditEvidence = {
  id: string;
  tenantId: string;
  controlId: string;
  hash: string;
  timestamp: string;
  immutable: true;
};

export type DataClassificationPolicy = {
  tenantId: string;
  piiPatterns: string[];
  secretPatterns: string[];
  defaultClass: "public" | "internal" | "confidential" | "restricted";
};

export type RetentionPolicy = {
  tenantId: string;
  minDays: number;
  maxDays: number;
};

export type LegalHoldPolicy = {
  tenantId: string;
  active: boolean;
  reason: string;
};

export type SecretLeakDetection = {
  leaked: boolean;
  matches: string[];
};

export type PiiDetection = {
  detected: boolean;
  matches: string[];
};

export type IncidentResponsePlan = {
  id: string;
  tenantId: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved";
  escalationRequired: boolean;
};

export type TrustCenterRecord = {
  id: string;
  tenantId: string;
  title: string;
  publicSummary: string;
  sensitiveFieldsRedacted: boolean;
};

export type SecurityException = {
  id: string;
  tenantId: string;
  requestedBy: string;
  reason: string;
  status: "requested" | "approved" | "rejected";
  approvalRoleRequired: "owner" | "admin";
};
