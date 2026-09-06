# Standalone image for repo-knowledge, built from a turbo-pruned monorepo subset
# (run `task docker:build` from this package's directory -- it calls
# `turbo prune` first so this Dockerfile only ever sees this package + its
# real workspace dependencies, never the rest of the monorepo).
FROM node:20-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS pruned
COPY .turbo-prune/repo-knowledge/json/ .
COPY .turbo-prune/repo-knowledge/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM pruned AS builder
COPY .turbo-prune/repo-knowledge/full/ .
RUN pnpm exec turbo run build --filter=@tst-autonomous/repo-knowledge

FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/services/repo-knowledge/dist ./dist
COPY --from=builder /app/services/repo-knowledge/package.json ./package.json
CMD ["node", "dist/index.js"]
