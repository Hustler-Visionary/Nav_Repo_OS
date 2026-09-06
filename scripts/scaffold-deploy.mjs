// Adds a Taskfile.yml + Dockerfile (turbo prune pattern) to a workspace package.
// Usage: node scripts/scaffold-deploy.mjs <dir> <name>
import { writeFileSync } from "node:fs";

const [, , dir, name] = process.argv;
if (!dir || !name) {
  console.error("usage: scaffold-deploy.mjs <dir> <name>");
  process.exit(1);
}

const taskfile = `version: "3"

vars:
  PKG: "@tst-autonomous/${name}"

tasks:
  build:
    desc: Compile this package via TypeScript project references
    cmds:
      - pnpm exec tsc -b .

  test:
    desc: Run this package's own tests (no-op if it has none)
    deps: [build]
    cmds:
      - sh -c 'ls dist/**/*.test.js >/dev/null 2>&1 && node --test dist/**/*.test.js || echo "no tests in {{.PKG}}"'

  docker:build:
    desc: Build a standalone image for just this package via turbo prune
    deps: [build]
    cmds:
      - pnpm exec turbo prune {{.PKG}} --docker --out-dir=.turbo-prune/${name}
      - docker build -f Dockerfile -t {{.PKG}}:local ../.. --build-arg PACKAGE_DIR=${dir}

  docker:push:
    desc: Push this package's image (tag comes from package.json version)
    deps: [docker:build]
    cmds:
      - sh -c 'V=$(node -p "require(\\"./package.json\\").version"); docker tag {{.PKG}}:local $REGISTRY/${name}:$V && docker push $REGISTRY/${name}:$V'
`;

const dockerfile = `# Standalone image for ${name}, built from a turbo-pruned monorepo subset
# (run \`task docker:build\` from this package's directory -- it calls
# \`turbo prune\` first so this Dockerfile only ever sees this package + its
# real workspace dependencies, never the rest of the monorepo).
FROM node:20-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS pruned
COPY .turbo-prune/${name}/json/ .
COPY .turbo-prune/${name}/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM pruned AS builder
COPY .turbo-prune/${name}/full/ .
RUN pnpm exec turbo run build --filter=@tst-autonomous/${name}

FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/${dir}/dist ./dist
COPY --from=builder /app/${dir}/package.json ./package.json
CMD ["node", "dist/index.js"]
`;

writeFileSync(`${dir}/Taskfile.yml`, taskfile);
writeFileSync(`${dir}/Dockerfile`, dockerfile);
console.log(`deploy files added to ${dir}`);
