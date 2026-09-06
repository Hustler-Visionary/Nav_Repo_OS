import type { TraceEvent } from "@tst-autonomous/kernel";

export type ValidationResult = {
  id: string;
  name: string;
  passed: boolean;
  notes: string;
};

export type ChangeRecord = {
  id: string;
  at: string;
  author: string;
  summary: string;
};

export type NodeStatus = "draft" | "ready" | "approved" | "implemented" | "verified" | "blocked";

export type RepoNode = {
  id: string;
  path: string;
  name: string;
  artifactType: "file" | "directory" | "service" | "module" | "policy" | "schema" | "contract" | "agent" | "spec";
  language?: string;
  layer: string;
  status: NodeStatus;
  risk: "low" | "medium" | "high";
  confidence: number;
  cost: "low" | "medium" | "high";
  codePreview: string;
  description: string;
  dependencies: string[];
  responsibilities: string[];
  architectureNotes: string[];
  traceEvents: TraceEvent[];
  validations: ValidationResult[];
  changelog: ChangeRecord[];
  evidenceRefs?: string[];
  sourcePath?: string;
  sourceHash?: string;
  readTimestamp?: string;
  providerId?: string;
  trustScore?: number;
  stalenessScore?: number;
  readOnlyLock?: boolean;
};
