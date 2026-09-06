# Standalone image for apps/api, built from a turbo-pruned monorepo subset
# (run `task docker:build` from this package's directory -- it calls
# `turbo prune` first so this Dockerfile only ever sees this package + its
# real workspace dependencies, never the rest of the monorepo).
FROM node:20-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS pruned
COPY .turbo-prune/api/json/ .
COPY .turbo-prune/api/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM pruned AS builder
COPY .turbo-prune/api/full/ .
RUN pnpm exec turbo run build --filter=@tst-autonomous/api

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/main.js"]
