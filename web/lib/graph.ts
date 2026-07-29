import { readdir, readFile as fsReadFile } from "node:fs/promises";
import path from "node:path";
import { createRealRepoReadOnlyProvider } from "../../src/domain/repo/providers/RealRepoReadOnlyProvider.js";

export type GraphNode = {
  id: string;
  path: string;
  name: string;
  layer: string;
  artifactType: "schema" | "service" | "agent" | "module" | "contract";
  status: "implemented";
  risk: "low" | "medium" | "high";
  confidence: number;
  cost: "low" | "medium" | "high";
  loc: number;
  inDegree: number;
  outDegree: number;
  blastRadius: number;
};

export type GraphEdge = { from: string; to: string };

export type RepoGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  scannedRoot: string;
};

const REPO_ROOT = path.resolve(process.cwd(), "..");
const DOMAIN_ROOT = path.join(REPO_ROOT, "src", "domain");
const SRC_ROOT = path.join(REPO_ROOT, "src");

const provider = createRealRepoReadOnlyProvider(SRC_ROOT);

const toRelPath = (absPath: string) => path.relative(REPO_ROOT, absPath).split(path.sep).join("/");

const listTsFiles = async (root: string): Promise<string[]> => {
  const entries = await readdir(root, { withFileTypes: true, recursive: true } as never);
  const files: string[] = [];
  for (const entry of entries as unknown as { name: string; parentPath?: string; path?: string; isFile: () => boolean }[]) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) continue;
    const base = entry.parentPath ?? entry.path ?? root;
    files.push(path.join(base, entry.name));
  }
  return files;
};

const inferArtifactType = (name: string): GraphNode["artifactType"] => {
  if (name.includes("types")) return "schema";
  if (name.includes("engine")) return "service";
  if (name.includes("commands") || name.includes("agent")) return "agent";
  if (name.includes("provider") || name.includes("contract")) return "contract";
  return "module";
};

const extractImportSpecifiers = (content: string): string[] => {
  const specifiers: string[] = [];
  const pattern = /from\s+["'](\.[^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    if (match[1]) specifiers.push(match[1]);
  }
  return specifiers;
};

const resolveSpecifier = (fromFileAbs: string, specifier: string): string | null => {
  const dir = path.dirname(fromFileAbs);
  let resolved = path.resolve(dir, specifier);
  if (resolved.endsWith(".js")) resolved = resolved.slice(0, -3) + ".ts";
  else if (!resolved.endsWith(".ts") && !resolved.endsWith(".tsx")) resolved += ".ts";
  return resolved;
};

const buildGraphForRoot = async (scanRootAbs: string): Promise<RepoGraph> => {
  const files = await listTsFiles(scanRootAbs);
  const relPaths = new Set(files.map(toRelPath));

  const rawNodes: (Omit<GraphNode, "risk" | "confidence" | "cost" | "blastRadius"> & { content: string })[] = [];
  const edges: GraphEdge[] = [];

  for (const abs of files) {
    const relPath = toRelPath(abs);
    const content = await fsReadFile(abs, "utf8");
    const layer = relPath.split("/")[2] ?? "domain";
    const name = path.basename(abs);
    const loc = content.split("\n").length;

    rawNodes.push({
      id: relPath,
      path: relPath,
      name,
      layer,
      artifactType: inferArtifactType(name),
      status: "implemented",
      loc,
      inDegree: 0,
      outDegree: 0,
      content
    });

    for (const specifier of extractImportSpecifiers(content)) {
      const resolvedAbs = resolveSpecifier(abs, specifier);
      if (!resolvedAbs) continue;
      const targetRel = toRelPath(resolvedAbs);
      if (relPaths.has(targetRel) && targetRel !== relPath) {
        edges.push({ from: relPath, to: targetRel });
      }
    }
  }

  const degree = new Map<string, { in: number; out: number }>();
  for (const node of rawNodes) degree.set(node.id, { in: 0, out: 0 });
  for (const edge of edges) {
    const from = degree.get(edge.from);
    const to = degree.get(edge.to);
    if (from) from.out += 1;
    if (to) to.in += 1;
  }

  const nodes: GraphNode[] = rawNodes.map(({ content, ...node }) => {
    const d = degree.get(node.id) ?? { in: 0, out: 0 };
    const total = d.in + d.out;
    const risk: GraphNode["risk"] = total >= 8 ? "high" : total >= 4 ? "medium" : "low";
    const confidence = Math.max(0.35, Math.round((1 - Math.min(d.out / 12, 0.6)) * 100) / 100);
    const cost: GraphNode["cost"] = node.loc >= 200 ? "high" : node.loc >= 60 ? "medium" : "low";
    const blastRadius = Math.round(Math.min(1, total / 15) * 100) / 100;
    return { ...node, inDegree: d.in, outDegree: d.out, risk, confidence, cost, blastRadius };
  });

  return { nodes, edges, scannedRoot: toRelPath(scanRootAbs) };
};

export const buildDomainGraph = (): Promise<RepoGraph> => buildGraphForRoot(DOMAIN_ROOT);
export const buildComponentsGraph = (): Promise<RepoGraph> => buildGraphForRoot(path.join(REPO_ROOT, "src", "components"));

export const readNodeSource = async (relPath: string): Promise<string> => {
  const abs = path.join(REPO_ROOT, relPath);
  return provider.readFile(abs);
};
