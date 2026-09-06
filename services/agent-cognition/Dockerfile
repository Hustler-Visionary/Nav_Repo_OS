# Standalone image for agent-cognition, built from a turbo-pruned monorepo subset
# (run `task docker:build` from this package's directory -- it calls
# `turbo prune` first so this Dockerfile only ever sees this package + its
# real workspace dependencies, never the rest of the monorepo).
FROM node:20-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS pruned
COPY .turbo-prune/agent-cognition/json/ .
COPY .turbo-prune/agent-cognition/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM pruned AS builder
COPY .turbo-prune/agent-cognition/full/ .
RUN pnpm exec turbo run build --filter=@tst-autonomous/agent-cognition

FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/services/agent-cognition/dist ./dist
COPY --from=builder /app/services/agent-cognition/package.json ./package.json
CMD ["node", "dist/index.js"]
