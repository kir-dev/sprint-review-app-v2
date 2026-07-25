# --- Build Stage ---
# node:24-slim is the Active LTS line (EOL 2028-04-30) and mirrors the official
# Next.js Docker example. Debian-based rather than Alpine, so native deps that
# Next pulls in (sharp) get glibc prebuilds and no libc6-compat shim is needed.
#
# Rebuilds should get the latest 24.x.
# Reproducibility comes from yarn.lock and the immutable sha-<commit> tag the
# build workflow publishes to Harbor.
FROM node:24-slim AS builder

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

# Build the frontend (produces apps/frontend/.next/standalone)
RUN yarn workspace frontend build

# --- Production Stage ---
FROM node:24-slim AS runner

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
