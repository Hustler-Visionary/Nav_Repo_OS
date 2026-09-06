# Standalone image for apps/web (REPO_OS), built from a turbo-pruned monorepo
# subset -- run `task docker:build` from this directory (calls `turbo prune`
# first, so this Dockerfile only ever sees web + the @tst-autonomous/* packages
# it actually depends on: repo-knowledge, graph-orchestration, product-narrative,
# governance-compliance, macro-apps -- never the rest of the monorepo).
FROM node:20-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS pruned
COPY .turbo-prune/web/json/ .
COPY .turbo-prune/web/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM pruned AS builder
COPY .turbo-prune/web/full/ .
RUN pnpm exec turbo run build --filter=web

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
