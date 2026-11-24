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

FROM postgres:17-bookworm AS single
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000 \
    PGDATA=/var/lib/postgresql/data/pgdata PGHOST=/run/bjj-postgres \
    PGUSER=postgres PGDATABASE=bjj_journey DB_DRIVER=postgres
COPY --from=dependencies /usr/local/bin/node /usr/local/bin/node
COPY --from=app --chown=postgres:postgres /app/ /app/
COPY --from=init --chown=postgres:postgres /app/ /opt/bjj-init/
COPY --chmod=0755 scripts/start-single-container.sh /usr/local/bin/start-bjj
# The inherited PostgreSQL port metadata does not publish a host port.
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/start-bjj"]
CMD ["node", "server.js"]
