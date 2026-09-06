import type { ApprovalPackage } from "@tst-autonomous/governance-compliance";
import type { RepoNode } from "./types.js";

export type RepoMode = "mock" | "readonly-real" | "governed-write";

export type RepoTreeItem = { path: string; type: "file" | "directory"; layer: string; artifactType: RepoNode["artifactType"] };
export type RepoMetadata = { path: string; language?: string; ownershipLayer: string; readCapability: boolean; writeCapability: boolean; approvalRequirement: ApprovalPackage["humanDecision"] | "required"; traceScope: string; dependencyScope: string; validationProfile: string };
export type RepoDependency = { from: string; to: string };
export type RepoChangeHistory = { at: string; author: string; summary: string }[];

export type ChangePreview = {
  commandId: string;
  affectedFiles: string[];
  beforeAfterConceptual: string[];
  risk: "low" | "medium" | "high";
  cost: "low" | "medium" | "high";
  confidence: number;
  expectedTraces: string[];
  rollbackPlan: string;
};

export interface RepoProvider {
  name: string;
  mode: RepoMode;
  listTree: () => Promise<RepoTreeItem[]>;
  readFile: (path: string) => Promise<string>;
  getMetadata: (path: string) => Promise<RepoMetadata>;
  getDependencies: (path: string) => Promise<RepoDependency[]>;
  getChangeHistory: (path: string) => Promise<RepoChangeHistory>;
  createChangePreview: (commandId: string) => Promise<ChangePreview>;
  applyApprovedChange: (approvalPackageId: string) => Promise<{ applied: boolean; reason?: string }>;
}
