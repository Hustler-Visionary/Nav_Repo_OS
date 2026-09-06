import type { RepoNode } from "./types.js";
import type { RepoDependency, RepoMetadata, RepoTreeItem } from "./provider.js";

export type RepoEdge = { from: string; to: string; scope: string };

export const normalizeTreeToNodes = (tree: RepoTreeItem[], metadataByPath: Record<string, RepoMetadata>): RepoNode[] =>
  tree.map((item) => {
    const metadata = metadataByPath[item.path];
    const baseNode: RepoNode = {
      id: item.path,
      path: item.path,
      name: item.path.split("/").at(-1) ?? item.path,
      artifactType: item.artifactType,
      layer: item.layer,
      status: "ready",
      risk: "low",
      confidence: 0.8,
      cost: "low",
      codePreview: "",
      description: `Live contract node for ${item.path}`,
      dependencies: [],
      responsibilities: ["Represent real repo artifact safely"],
      architectureNotes: [`read:${metadata?.readCapability ?? false}`, `write:${metadata?.writeCapability ?? false}`],
      traceEvents: [],
      validations: [],
      changelog: []
    };
    if (metadata?.language) {
      return { ...baseNode, language: metadata.language };
    }
    return baseNode;
  });

export const normalizeDependenciesToEdges = (deps: RepoDependency[], scope = "internal"): RepoEdge[] => deps.map((d) => ({ from: d.from, to: d.to, scope }));
