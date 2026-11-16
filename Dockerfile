# One image, one Node.js process. NestJS serves the API under /api and hands
# every other request to the Next.js standalone build loaded into the same
# process (apps/backend/src/frontend/next-frontend.ts).
#
# node:24-alpine is the Active LTS line. The native deps we ship (sharp,
# @next/swc, the Prisma engines) all have musl builds, so no glibc shim is
# needed. Reproducibility comes from yarn.lock and the immutable sha-<commit>
# tag the build workflow publishes.
FROM node:24-alpine AS base

WORKDIR /app

RUN apk add --no-cache openssl

FROM base AS build

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN yarn install --frozen-lockfile

COPY apps/backend ./apps/backend
COPY apps/frontend ./apps/frontend

# After building, prune the traced Next.js node_modules. The tracer is
# conservative and yarn v1 ignores the `libc` field on optional deps:
#   typescript                         only used by `next build` type-checking
#   @img/sharp-libvips-linux-*         glibc libvips; this image is musl/Alpine
#   @img/sharp-linux-*                 ditto, the glibc binding
# The musl variants (@img/*-linuxmusl-*) stay: next/image needs them. This has
# to happen here: an `rm` in the runner would not shrink the copied layer.
RUN yarn workspace backend prisma generate \
    && yarn workspace backend build \
    && yarn workspace frontend build \
    && rm -rf apps/frontend/.next/standalone/node_modules/typescript \
      apps/frontend/.next/standalone/node_modules/@img/sharp-libvips-linux-* \
      apps/frontend/.next/standalone/node_modules/@img/sharp-linux-*

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
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_PATH=/app/node_modules:/app/apps/backend/node_modules \
    PORT=3000 \
    FRONTEND_DIR=/app/apps/frontend

# The entrypoint runs the Prisma CLI; stop it phoning home for update checks.
ENV CHECKPOINT_DISABLE=1

# The Next.js standalone tree (traced node_modules with next/react, server
# chunks) goes first; the backend's production dependencies are layered on top
# so that the generated Prisma client wins over anything the trace pulled in.
COPY --from=build --chown=node:node /app/apps/frontend/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build --chown=node:node /app/apps/frontend/public ./apps/frontend/public
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=production-dependencies --chown=node:node /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build --chown=node:node /app/apps/backend/dist ./apps/backend/dist
COPY --chown=node:node apps/backend/package.json ./apps/backend/package.json
COPY --chown=node:node apps/backend/prisma/schema.prisma ./apps/backend/prisma/schema.prisma
COPY --chown=node:node apps/backend/prisma/migrations ./apps/backend/prisma/migrations
COPY --chown=node:node --chmod=0755 apps/backend/docker-entrypoint.sh ./apps/backend/docker-entrypoint.sh

# next/image writes optimised variants here at runtime, so it must be writable
# by the unprivileged user. Counts against the pod's ephemeral-storage limit.
RUN mkdir -p apps/frontend/.next/cache \
  && chown -R node:node apps/frontend/.next/cache

USER node

EXPOSE 3000

# Runs `prisma migrate deploy`, then execs the app (see the script).
CMD ["apps/backend/docker-entrypoint.sh"]
