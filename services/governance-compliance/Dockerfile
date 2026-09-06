# Standalone image for governance-compliance, built from a turbo-pruned monorepo subset
# (run `task docker:build` from this package's directory -- it calls
# `turbo prune` first so this Dockerfile only ever sees this package + its
# real workspace dependencies, never the rest of the monorepo).
FROM node:20-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS pruned
COPY .turbo-prune/governance-compliance/json/ .
COPY .turbo-prune/governance-compliance/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM pruned AS builder
COPY .turbo-prune/governance-compliance/full/ .
RUN pnpm exec turbo run build --filter=@tst-autonomous/governance-compliance

FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/services/governance-compliance/dist ./dist
COPY --from=builder /app/services/governance-compliance/package.json ./package.json
CMD ["node", "dist/index.js"]
