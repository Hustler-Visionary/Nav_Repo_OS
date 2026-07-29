import path from "node:path";

/**
 * The repo being explored by the graph + Monaco code viewer. Defaults to
 * this app's own parent directory (today's self-hosted arrangement, where
 * web/ lives inside the repo it visualizes). Set TARGET_REPO_ROOT to point
 * REPO_OS at a different, real repository without code changes.
 *
 * This only affects the generic parts (file-scan graph, dependency edges,
 * real source code reading). The chat's execute-intent.ts and the UI
 * preview's ui-preview-samples.ts import specific functions from *this*
 * repo's src/domain (runVerticalSliceDeterministic, createOrganizationGraph,
 * etc.) at build time -- those are tied to this demo's own domain model and
 * would need dedicated rework once a real target repo's structure is known.
 */
export const REPO_ROOT = process.env.TARGET_REPO_ROOT ? path.resolve(process.env.TARGET_REPO_ROOT) : path.resolve(process.cwd(), "..");

export const SRC_SCAN_DIR = process.env.TARGET_SRC_PATH || "src";
export const DOMAIN_SCAN_DIR = process.env.TARGET_DOMAIN_PATH || "src/domain";
export const UI_SCAN_DIR = process.env.TARGET_UI_PATH || "src/components";
