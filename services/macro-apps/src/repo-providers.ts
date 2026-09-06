import type { AppState } from "./store.js";
import type { ApprovalPackage } from "@tst-autonomous/governance-compliance";
import type { TraceEvent } from "@tst-autonomous/kernel";
import type { RepoProvider, RepoTreeItem, RepoMetadata, RepoDependency, RepoChangeHistory, ChangePreview } from "@tst-autonomous/repo-knowledge";

const now = () => new Date().toISOString();
const mkTrace = (type: TraceEvent["type"], details: string): TraceEvent => ({ id: `${type}-${Date.now()}`, type, timestamp: now(), actor: "system", details });

const mockTree: RepoTreeItem[] = [
  { path: "src/domain/repo/provider.ts", type: "file", layer: "domain", artifactType: "contract" },
  { path: "src/app/store.ts", type: "file", layer: "app", artifactType: "module" }
];

export const createMockRepoProvider = (stateRef: () => AppState, onTrace: (event: TraceEvent) => void): RepoProvider => ({
  name: "MockRepoProvider",
  mode: "mock",
  listTree: async () => { onTrace(mkTrace("repo_tree_loaded", "mock tree loaded")); return [...mockTree]; },
  readFile: async (path) => { onTrace(mkTrace("repo_file_read", path)); return `// mock read for ${path}`; },
  getMetadata: async (path) => ({ path, language: "typescript", ownershipLayer: "domain", readCapability: true, writeCapability: false, approvalRequirement: "required", traceScope: "repo", dependencyScope: "internal", validationProfile: "strict" }),
  getDependencies: async (path) => [{ from: path, to: "src/app/store.ts" }],
  getChangeHistory: async () => [{ at: now(), author: "mock-agent", summary: "created mock node" }],
  createChangePreview: async (commandId) => { onTrace(mkTrace("repo_change_preview_created", commandId)); return { commandId, affectedFiles: ["src/app/store.ts"], beforeAfterConceptual: ["before: old", "after: new"], risk: "medium", cost: "low", confidence: 0.8, expectedTraces: ["repo_change_apply_requested", "repo_change_applied"], rollbackPlan: "revert mock patch" }; },
  applyApprovedChange: async (approvalPackageId) => {
    onTrace(mkTrace("repo_change_apply_requested", approvalPackageId));
    const approved = stateRef().governanceSlice.approvalPackages.some((p: ApprovalPackage) => p.id === approvalPackageId && p.humanDecision === "approved");
    if (!approved) { onTrace(mkTrace("repo_change_blocked", "approval missing")); return { applied: false, reason: "approval missing" }; }
    onTrace(mkTrace("repo_change_applied", approvalPackageId));
    return { applied: true };
  }
});

const blockedProvider = (name: string, mode: RepoProvider["mode"]): RepoProvider => ({
  name,
  mode,
  listTree: async () => [],
  readFile: async () => "",
  getMetadata: async (path: string): Promise<RepoMetadata> => ({ path, ownershipLayer: "n/a", readCapability: false, writeCapability: false, approvalRequirement: "required", traceScope: "blocked", dependencyScope: "none", validationProfile: "blocked" }),
  getDependencies: async (): Promise<RepoDependency[]> => [],
  getChangeHistory: async (): Promise<RepoChangeHistory> => [],
  createChangePreview: async (commandId: string): Promise<ChangePreview> => ({ commandId, affectedFiles: [], beforeAfterConceptual: ["blocked"], risk: "high", cost: "low", confidence: 0, expectedTraces: ["repo_change_blocked"], rollbackPlan: "none" }),
  applyApprovedChange: async () => ({ applied: false, reason: `${name} disabled by default` })
});

export const createFileSystemRepoProviderStub = (): RepoProvider => blockedProvider("FileSystemRepoProvider", "readonly-real");
export const createGitRepoProviderStub = (): RepoProvider => blockedProvider("GitRepoProvider", "readonly-real");
