# Standalone image for platform-integration, built from a turbo-pruned monorepo subset
# (run `task docker:build` from this package's directory -- it calls
# `turbo prune` first so this Dockerfile only ever sees this package + its
# real workspace dependencies, never the rest of the monorepo).
FROM node:20-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS pruned
COPY .turbo-prune/platform-integration/json/ .
COPY .turbo-prune/platform-integration/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM pruned AS builder
COPY .turbo-prune/platform-integration/full/ .
RUN pnpm exec turbo run build --filter=@tst-autonomous/platform-integration

FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/infra/platform-integration/dist ./dist
COPY --from=builder /app/infra/platform-integration/package.json ./package.json
CMD ["node", "dist/index.js"]
