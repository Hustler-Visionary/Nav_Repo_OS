export type MCPType = "internal" | "tenant" | "marketplace" | "enterprise" | "system" | "experimental";
export type MCPState = "registered" | "disabled" | "enabled" | "sandboxed" | "approval_required" | "blocked" | "quarantined" | "deprecated";

export type MCPScope = { tenantId: string; projectId: string };

export type MCPPermission = {
  id: string;
  appId: string;
  toolId: string;
  policyDecisionRequired: boolean;
  constitutionalValidationRequired: boolean;
};

export type MCPApprovalRequirement = {
  requiresApproval: boolean;
  governanceReviewRequired: boolean;
};

export type MCPTrustProfile = {
  appId: string;
  score: number;
  rationale: string;
};

export type MCPBoundary = {
  networkScope: string[];
  filesystemScope: string[];
  tenantProjectScopeRequired: boolean;
  secretsByReferenceOnly: boolean;
};

export type MCPServer = { id: string; name: string; state: MCPState; type: MCPType };
export type MCPApp = { id: string; serverId: string; name: string; type: MCPType; state: MCPState; trustProfile?: MCPTrustProfile };

export type MCPTool = {
  id: string;
  appId: string;
  name: string;
  inputSchema?: string;
  outputSchema?: string;
  rollbackSupport: boolean;
  replaySupport: boolean;
  requiresSecretReference: boolean;
  hasExternalSideEffect: boolean;
};

export type MCPCapability = { id: string; appId: string; toolId: string; policyLink: string; scope: MCPScope };
export type MCPToolRegistry = { tools: MCPTool[] };
export type MCPAppRegistry = { apps: MCPApp[] };

export type MCPInvocation = {
  id: string;
  appId: string;
  toolId: string;
  scope: MCPScope;
  mutatesState: boolean;
  approvalPackageApproved: boolean;
  policyDecisionPassed: boolean;
  constitutionalDecisionPassed: boolean;
};

export type MCPInvocationReceipt = { invocationId: string; status: "simulated" | "blocked" | "completed"; replayable: boolean };
export type MCPAuditReceipt = { invocationId: string; auditId: string; tenantId: string; projectId: string };
export type MCPReplayRecord = { invocationId: string; timeline: string[] };

export type MCPAppSandbox = {
  appId: string;
  toolPermissionsValidated: boolean;
  networkScopeValidated: boolean;
  filesystemScopeValidated: boolean;
  tenantProjectScopeValidated: boolean;
  secretsBoundaryValidated: boolean;
  outputRedactionValidated: boolean;
  timeoutMs: number;
  resourceBudget: number;
  replayMetadata: string;
  rollbackMetadata: string;
};

export type MCPUIAction = {
  id: string;
  label: string;
  appId: string;
  toolId: string;
  actionType: string;
  mutatesState: boolean;
  requiresApproval: boolean;
  requiredPolicyEffects: string[];
  inputSchema: string;
  outputSchema: string;
  tenantScope: string;
  projectScope: string;
  traceEvents: string[];
  rollbackSupport: boolean;
  replaySupport: boolean;
};

export type MCPUIActionPolicy = { policyRuntimeRequired: boolean; constitutionalRuntimeRequired: boolean };
export type MCPUIComponent = { name: string; visible: boolean };

export type MCPMarketplaceEntry = {
  id: string;
  appId: string;
  trustProfile: MCPTrustProfile;
  permissionsRequested: string[];
  riskScore: number;
  approvalRequirement: MCPApprovalRequirement;
  installBlockedByDefault: boolean;
  governanceReviewState: "pending" | "approved" | "rejected";
};

export type MCPCapabilityGraph = {
  appToTools: Record<string, string[]>;
  toolToPolicies: Record<string, string[]>;
  toolToScopes: Record<string, string[]>;
  toolToCanvasNodes: Record<string, string[]>;
  toolToLedgerEvents: Record<string, string[]>;
  toolToRisks: Record<string, string[]>;
  toolToRollbackSupport: Record<string, boolean>;
  toolToReplaySupport: Record<string, boolean>;
};
