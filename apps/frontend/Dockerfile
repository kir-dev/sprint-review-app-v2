# --- Build Stage ---
# node:24-alpine is the Active LTS line (EOL 2028-04-30). Alpine rather than
# Debian slim: the Debian base alone costs ~110MB more, and the native deps we
# actually ship (sharp, @next/swc) all publish musl prebuilds that yarn already
# resolves from yarn.lock, so no libc6-compat shim is needed.
#
# Rebuilds should get the latest 24.x.
# Reproducibility comes from yarn.lock and the immutable sha-<commit> tag the
# build workflow publishes to Harbor.
FROM node:24-alpine AS builder

WORKDIR /app

# Copy root package.json and yarn.lock for workspace resolution
COPY package.json yarn.lock ./

# Copy frontend package.json to the correct workspace location
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies (frozen lockfile for consistency)
RUN yarn install --frozen-lockfile

# Copy the source code for the frontend
COPY apps/frontend ./apps/frontend

# NOTE: the backend URL is NOT baked in here. It is resolved at runtime from
# the BACKEND_PUBLIC_URL env var, so this single image can serve any number of
# deployed instances. See the runner stage / k8s Deployment.
ENV NEXT_TELEMETRY_DISABLED=1

# Build the frontend (produces apps/frontend/.next/standalone), then prune the
# traced node_modules. The tracer is conservative and yarn v1 ignores the `libc`
# field on optional deps, so ~35MB of the 80MB tree is unreachable at runtime:
#
#   typescript (19MB)                   only used by `next build` type-checking
#   @img/sharp-libvips-linux-* (16MB)   glibc libvips; this image is musl/Alpine
#   @img/sharp-linux-* (0.5MB)          ditto, the glibc binding
#
# The musl variants (@img/*-linuxmusl-*) are deliberately kept — sharp resolves
# them at runtime for next/image. Note the `linux-` hyphen in the globs: it is
# what keeps `linuxmusl-` from matching.
#
# This has to happen in the builder, not the runner: an `rm` after the COPY
# would add a whitelist layer without shrinking the image below it.
# outputFileTracingExcludes would be the idiomatic fix, but Turbopack builds
# ignore it (see next.config.mjs).
RUN yarn workspace frontend build \
  && rm -rf apps/frontend/.next/standalone/node_modules/typescript \
    apps/frontend/.next/standalone/node_modules/@img/sharp-libvips-linux-* \
    apps/frontend/.next/standalone/node_modules/@img/sharp-linux-*

# --- Production Stage ---
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Next.js standalone server reads these at runtime
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# The standalone output already contains a minimal node_modules and server.js.
# Because outputFileTracingRoot is the repo root, the tree is rooted at /app
# with the server entrypoint at apps/frontend/server.js.
COPY --from=builder --chown=node:node /app/apps/frontend/.next/standalone ./

# Static assets and the public/ folder are NOT included in standalone output
COPY --from=builder --chown=node:node /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=node:node /app/apps/frontend/public ./apps/frontend/public

# next/image writes optimised variants here at runtime, so it must be writable
# by the unprivileged user. Counts against the pod's ephemeral-storage limit.
RUN mkdir -p apps/frontend/.next/cache \
  && chown -R node:node apps/frontend/.next/cache

# Run unprivileged as the `node` user (uid/gid 1000) that ships with the image,
# as the official Next.js example does.
USER node

# Expose the application port
EXPOSE 3000

# Exec form, so node is PID 1 and receives SIGTERM directly: the Next.js server
# then drains in-flight requests before exiting. Give it room to do so with
# terminationGracePeriodSeconds in k8s (see DEPLOYMENT.md).
CMD ["node", "apps/frontend/server.js"]
