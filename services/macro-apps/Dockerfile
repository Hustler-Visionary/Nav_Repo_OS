# Standalone image for macro-apps, built from a turbo-pruned monorepo subset
# (run `task docker:build` from this package's directory -- it calls
# `turbo prune` first so this Dockerfile only ever sees this package + its
# real workspace dependencies, never the rest of the monorepo).
FROM node:20-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS pruned
COPY .turbo-prune/macro-apps/json/ .
COPY .turbo-prune/macro-apps/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM pruned AS builder
COPY .turbo-prune/macro-apps/full/ .
RUN pnpm exec turbo run build --filter=@tst-autonomous/macro-apps

FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/services/macro-apps/dist ./dist
COPY --from=builder /app/services/macro-apps/package.json ./package.json
CMD ["node", "dist/index.js"]
