import type {
  MCPApp,
  MCPAppRegistry,
  MCPAuditReceipt,
  MCPBoundary,
  MCPCapability,
  MCPCapabilityGraph,
  MCPInvocation,
  MCPInvocationReceipt,
  MCPMarketplaceEntry,
  MCPPermission,
  MCPReplayRecord,
  MCPScope,
  MCPServer,
  MCPTool,
  MCPToolRegistry,
  MCPTrustProfile,
  MCPUIAction,
  MCPUIActionPolicy
} from "./types.js";

export const registerMCPServer = (servers: MCPServer[], server: MCPServer): MCPServer[] => [...servers, server];
export const registerMCPApp = (registry: MCPAppRegistry, app: MCPApp): MCPAppRegistry => ({ apps: [...registry.apps, { ...app, state: "disabled" }] });
export const registerMCPTool = (registry: MCPToolRegistry, tool: MCPTool): MCPToolRegistry => ({ tools: [...registry.tools, tool] });

export const buildMCPCapabilityGraph = (apps: MCPApp[], tools: MCPTool[], capabilities: MCPCapability[]): MCPCapabilityGraph => {
  const appToTools: Record<string, string[]> = {};
  const toolToPolicies: Record<string, string[]> = {};
  const toolToScopes: Record<string, string[]> = {};
  const toolToCanvasNodes: Record<string, string[]> = {};
  const toolToLedgerEvents: Record<string, string[]> = {};
  const toolToRisks: Record<string, string[]> = {};
  const toolToRollbackSupport: Record<string, boolean> = {};
  const toolToReplaySupport: Record<string, boolean> = {};
  for (const app of apps) appToTools[app.id] = tools.filter((t) => t.appId === app.id).map((t) => t.id);
  for (const cap of capabilities) {
    toolToPolicies[cap.toolId] = [cap.policyLink];
    toolToScopes[cap.toolId] = [`${cap.scope.tenantId}/${cap.scope.projectId}`];
    toolToCanvasNodes[cap.toolId] = [`node:${cap.toolId}`];
    toolToLedgerEvents[cap.toolId] = ["mcp_invocation_completed"];
    toolToRisks[cap.toolId] = ["bounded-by-policy"];
  }
  for (const tool of tools) {
    toolToRollbackSupport[tool.id] = tool.rollbackSupport;
    toolToReplaySupport[tool.id] = tool.replaySupport;
  }
  return { appToTools, toolToPolicies, toolToScopes, toolToCanvasNodes, toolToLedgerEvents, toolToRisks, toolToRollbackSupport, toolToReplaySupport };
};

export const evaluateMCPPermission = (permission: MCPPermission | undefined): boolean => Boolean(permission?.policyDecisionRequired);
export const validateMCPScope = (scope: MCPScope): boolean => scope.tenantId.length > 0 && scope.projectId.length > 0;

export const createMCPInvocation = (invocation: MCPInvocation): MCPInvocation => invocation;
export const simulateMCPInvocation = (invocation: MCPInvocation): MCPInvocationReceipt => ({ invocationId: invocation.id, status: "simulated", replayable: true });
export const blockMCPInvocation = (invocationId: string): MCPInvocationReceipt => ({ invocationId, status: "blocked", replayable: true });
export const quarantineMCPApp = (app: MCPApp): MCPApp => ({ ...app, state: "quarantined" });
export const createMCPAuditReceipt = (invocation: MCPInvocation): MCPAuditReceipt => ({ invocationId: invocation.id, auditId: `audit-${invocation.id}`, tenantId: invocation.scope.tenantId, projectId: invocation.scope.projectId });
export const replayMCPInvocation = (receipt: MCPInvocationReceipt): MCPReplayRecord => ({ invocationId: receipt.invocationId, timeline: [`${receipt.status}`, "replayed"] });
export const calculateMCPTrust = (profile: MCPTrustProfile): MCPTrustProfile => ({ ...profile, score: Math.max(0, Math.min(1, profile.score)) });

export const validateMCPUIAction = (action: MCPUIAction, policy: MCPUIActionPolicy): boolean => {
  if (action.mutatesState && !action.requiresApproval) return false;
  if (!policy.policyRuntimeRequired || !policy.constitutionalRuntimeRequired) return false;
  return action.inputSchema.length > 0 && action.outputSchema.length > 0;
};

export const renderMCPUIActionModel = (action: MCPUIAction): string => `${action.label} [${action.actionType}] ${action.tenantScope}/${action.projectScope}`;
export const linkMCPAppToCanvasNode = (appId: string, nodeId: string): string => `${appId}->${nodeId}`;
export const linkMCPToolToPolicyRuntime = (toolId: string, policyId: string): string => `${toolId}->${policyId}`;
export const linkMCPInvocationToLedger = (invocationId: string, ledgerId: string): string => `${invocationId}->${ledgerId}`;

export const canInstallMarketplaceEntry = (entry: MCPMarketplaceEntry): boolean => !entry.installBlockedByDefault && entry.governanceReviewState === "approved";

export const validateMCPToolForExecution = (tool: MCPTool, boundary: MCPBoundary, secretByValueProvided: boolean): boolean => {
  if (!tool.inputSchema || !tool.outputSchema) return false;
  if (tool.requiresSecretReference && secretByValueProvided) return false;
  if (tool.hasExternalSideEffect && boundary.networkScope.length === 0) return false;
  return boundary.tenantProjectScopeRequired && boundary.secretsByReferenceOnly;
};

export const enforceMCPInvocationRules = (
  invocation: MCPInvocation,
  permission: MCPPermission | undefined,
  scopeValid: boolean,
  app: MCPApp,
  trustProfile: MCPTrustProfile | undefined
): MCPInvocationReceipt => {
  if (app.state === "quarantined") return blockMCPInvocation(invocation.id);
  if (!trustProfile) return blockMCPInvocation(invocation.id);
  if (!evaluateMCPPermission(permission)) return blockMCPInvocation(invocation.id);
  if (!scopeValid) return blockMCPInvocation(invocation.id);
  if (invocation.mutatesState && !invocation.approvalPackageApproved) return blockMCPInvocation(invocation.id);
  if (!invocation.policyDecisionPassed || !invocation.constitutionalDecisionPassed) return blockMCPInvocation(invocation.id);
  return { invocationId: invocation.id, status: "completed", replayable: true };
};
