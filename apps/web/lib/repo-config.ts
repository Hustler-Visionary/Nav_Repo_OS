import path from "node:path";
import { readdirSync } from "node:fs";

/**
 * The repo being explored by the graph + Monaco code viewer. Defaults to
 * this app's own repo root (apps/web is 2 levels below it). Set
 * TARGET_REPO_ROOT to point REPO_OS at a different, real repository without
 * code changes.
 *
 * This only affects the generic parts (file-scan graph, dependency edges,
 * real source code reading). The chat's execute-intent.ts and the UI
 * preview's ui-preview-samples.ts import specific functions from this repo's
 * @tst-autonomous/* packages at build time -- those are tied to this demo's
 * own domain model and would need dedicated rework once a real target repo's
 * structure is known.
 */
export const REPO_ROOT = process.env.TARGET_REPO_ROOT ? path.resolve(process.env.TARGET_REPO_ROOT) : path.resolve(process.cwd(), "../..");

const WORKSPACE_CATEGORIES = (process.env.TARGET_WORKSPACE_CATEGORIES || "packages,services,infra,execution").split(",");

/**
 * Every workspace package's src/ dir (e.g. "services/governance-compliance/src"),
 * discovered by listing the workspace category folders instead of hardcoding
 * package names -- this is the post-DDD-split replacement for the old single
 * "src/domain" root: the domain graph is now the union of every package's
 * src/ (minus its presentation/ subfolder), and the UI graph is the union of
 * every package's presentation/ subfolder.
 */
const discoverPackageSrcDirs = (): string[] => {
  const dirs: string[] = [];
  for (const category of WORKSPACE_CATEGORIES) {
    const categoryAbs = path.join(REPO_ROOT, category);
    let entries: { name: string; isDirectory: () => boolean }[] = [];
    try {
      entries = readdirSync(categoryAbs, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      dirs.push(path.join(category, entry.name, "src"));
    }
  }
  return dirs;
};

export const DOMAIN_SCAN_ROOTS = process.env.TARGET_DOMAIN_PATH ? [process.env.TARGET_DOMAIN_PATH] : discoverPackageSrcDirs();

export const UI_SCAN_ROOTS = process.env.TARGET_UI_PATH
  ? [process.env.TARGET_UI_PATH]
  : discoverPackageSrcDirs().map((dir) => path.join(dir, "presentation"));

/** Used by /api/file to reject reads outside the scanned roots. */
export const isScannedPath = (relPath: string): boolean =>
  [...DOMAIN_SCAN_ROOTS, ...UI_SCAN_ROOTS].some((root) => relPath === root || relPath.startsWith(`${root}/`));
