FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
RUN npm install --global pnpm@10.30.3
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
COPY . .
RUN NEXT_STANDALONE=1 NEXT_TELEMETRY_DISABLED=1 \
    DATABASE_URL=postgresql://build@localhost:5432/build pnpm build

FROM dependencies AS init
COPY --chown=node:node package.json ./
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node drizzle ./drizzle
COPY --chown=node:node lib/training/catalog ./lib/training/catalog
USER node
CMD ["sh", "-ec", "node scripts/migrate-training.mjs --apply && node scripts/seed-training-catalog.mjs --apply"]

FROM node:24-bookworm-slim AS app
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
