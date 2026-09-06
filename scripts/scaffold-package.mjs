// One-off scaffolding helper used during the services/infra/execution split.
// Usage: node scripts/scaffold-package.mjs <dir> <name> <dep1,dep2,...>
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const REGISTRY = {
  kernel: "packages/kernel",
  "governance-compliance": "services/governance-compliance",
  "repo-knowledge": "services/repo-knowledge",
  "agent-cognition": "services/agent-cognition",
  "product-narrative": "services/product-narrative",
  "macro-apps": "services/macro-apps",
  "platform-integration": "infra/platform-integration",
  "graph-orchestration": "execution/graph-orchestration",
  "runtime-fabric": "execution/runtime-fabric"
};

const [, , dir, name, depsArg] = process.argv;
if (!dir || !name) {
  console.error("usage: scaffold-package.mjs <dir> <name> <dep1,dep2,...>");
  process.exit(1);
}
const deps = depsArg ? depsArg.split(",").filter(Boolean) : [];

const root = path.resolve(dir);
mkdirSync(path.join(root, "src"), { recursive: true });

const depth = dir.split("/").length;
const toRoot = "../".repeat(depth);

const pkgJson = {
  name: `@tst-autonomous/${name}`,
  version: "0.1.0",
  private: true,
  type: "module",
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  scripts: {
    build: "tsc -b",
    test: "node --test dist/**/*.test.js"
  },
  ...(deps.length
    ? { dependencies: Object.fromEntries(deps.map((d) => [`@tst-autonomous/${d}`, "workspace:*"])) }
    : {}),
  devDependencies: {
    "@types/node": "^22.9.0",
    typescript: "^5.6.3"
  }
};

const tsconfig = {
  extends: `${toRoot}tsconfig.base.json`,
  compilerOptions: {
    composite: true,
    rootDir: "src",
    outDir: "dist",
    tsBuildInfoFile: "dist/.tsbuildinfo"
  },
  include: ["src"],
  ...(deps.length
    ? {
        references: deps.map((d) => {
          const depDir = REGISTRY[d];
          if (!depDir) throw new Error(`unknown dep ${d}`);
          return { path: path.relative(root, path.resolve(depDir)) };
        })
      }
    : {})
};

const pkgPath = path.join(root, "package.json");
const tsPath = path.join(root, "tsconfig.json");
writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + "\n");
writeFileSync(tsPath, JSON.stringify(tsconfig, null, 2) + "\n");
console.log(`scaffolded ${dir}`);
