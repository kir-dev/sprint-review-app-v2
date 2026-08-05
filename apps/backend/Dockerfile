FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache openssl

FROM base AS build

COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/package.json
RUN yarn install --frozen-lockfile

COPY apps/backend ./apps/backend
RUN yarn workspace backend prisma generate \
    && yarn workspace backend build

FROM base AS production-dependencies

ENV NODE_ENV=production

COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/backend/prisma/schema.prisma ./apps/backend/prisma/schema.prisma
COPY apps/backend/prisma/migrations ./apps/backend/prisma/migrations
RUN yarn install --frozen-lockfile --production=true \
    && yarn workspace backend prisma generate \
    && yarn cache clean

FROM base AS runner

ENV NODE_ENV=production \
    NODE_PATH=/app/node_modules:/app/apps/backend/node_modules \
    PORT=3001

COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=production-dependencies --chown=node:node /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build --chown=node:node /app/apps/backend/dist ./apps/backend/dist
COPY --chown=node:node package.json ./package.json
COPY --chown=node:node apps/backend/package.json ./apps/backend/package.json
COPY --chown=node:node apps/backend/prisma/schema.prisma ./apps/backend/prisma/schema.prisma
COPY --chown=node:node apps/backend/prisma/migrations ./apps/backend/prisma/migrations

USER node

EXPOSE 3001

CMD ["node", "--max-http-header-size=81920", "apps/backend/dist/src/main.js"]
