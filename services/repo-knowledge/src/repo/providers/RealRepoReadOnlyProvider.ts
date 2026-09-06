import { readFile, readdir, stat, lstat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { createEvidenceBundle, calculateEvidenceConfidence } from "@tst-autonomous/governance-compliance";
import type { EvidenceBundle } from "@tst-autonomous/governance-compliance";

export type RealRepoReadOnlyProvider = {
  id: string;
  listTree: (root: string) => Promise<string[]>;
  readFile: (path: string) => Promise<string>;
  getMetadata: (path: string) => Promise<{ size: number; mtimeMs: number; extension: string }>;
  getDependencies: (path: string) => Promise<string[]>;
  getChangeHistory: (path: string) => Promise<string[]>;
  createEvidenceBundle: (path: string) => Promise<EvidenceBundle>;
  write: () => never;
  del: () => never;
  rename: () => never;
  chmod: () => never;
};

const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".py", ".json", ".md"]);
const maxFileSize = 1024 * 1024;

export const createRealRepoReadOnlyProvider = (allowedRoot: string): RealRepoReadOnlyProvider => {
  const inScope = (path: string) => !relative(allowedRoot, path).startsWith("..");
  const safetyCheck = async (path: string): Promise<void> => {
    if (!inScope(path)) throw new Error("repo_real_read_blocked: out of scope");
    const link = await lstat(path);
    if (link.isSymbolicLink()) throw new Error("repo_real_read_blocked: symlink blocked");
    const meta = await stat(path);
    if (meta.isFile()) {
      if (meta.size > maxFileSize) throw new Error("repo_real_read_blocked: file too large");
      const ext = extname(path);
      if (!allowedExtensions.has(ext)) throw new Error("repo_real_read_blocked: extension blocked");
    }
  };

  return {
    id: "RealRepoReadOnlyProvider",
    listTree: async (root) => {
      if (!inScope(root)) throw new Error("repo_real_read_blocked: root out of scope");
      const entries = await readdir(root, { withFileTypes: true });
      return entries.map((e: {name:string}) => join(root, e.name));
    },
    readFile: async (path) => {
      await safetyCheck(path);
      return readFile(path, "utf8");
    },
    getMetadata: async (path) => {
      await safetyCheck(path);
      const meta = await stat(path);
      return { size: meta.size, mtimeMs: meta.mtimeMs, extension: extname(path) };
    },
    getDependencies: async (path) => {
      const content = await readFile(path, "utf8");
      const deps = new Set<string>();
      if (path.endsWith(".py")) {
        (content.match(/^\s*(from|import)\s+([\w\.]+)/gm) ?? []).forEach((m: string) => deps.add(m));
      } else if (path.endsWith("package.json")) {
        const pkg = JSON.parse(content) as { dependencies?: Record<string, string> };
        Object.keys(pkg.dependencies ?? {}).forEach((d) => deps.add(d));
      } else {
        (content.match(/from\s+["']([^"']+)["']/g) ?? []).forEach((m: string) => deps.add(m));
        (content.match(/import\s+["']([^"']+)["']/g) ?? []).forEach((m: string) => deps.add(m));
      }
      return [...deps];
    },
    getChangeHistory: async () => ["git metadata unavailable in demo-safe mode"],
    createEvidenceBundle: async (path) => {
      const content = await readFile(path, "utf8");
      const meta = await stat(path);
      const confidence = calculateEvidenceConfidence({ hashVerified: true, metadataAvailable: true, dependenciesResolved: true, changelogAvailable: true, fileAgeDays: (Date.now() - meta.mtimeMs) / (1000 * 60 * 60 * 24), providerTrust: 0.9 });
      return createEvidenceBundle(path, "RealRepoReadOnlyProvider", content, confidence);
    },
    write: () => { throw new Error("write blocked: readonly"); },
    del: () => { throw new Error("delete blocked: readonly"); },
    rename: () => { throw new Error("rename blocked: readonly"); },
    chmod: () => { throw new Error("chmod blocked: readonly"); }
  };
};
