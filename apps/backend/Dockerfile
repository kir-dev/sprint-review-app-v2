FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json and yarn.lock for workspace resolution
COPY package.json yarn.lock ./

# Copy backend package.json to the correct workspace location
COPY apps/backend/package.json ./apps/backend/

# Install dependencies (frozen lockfile for consistency)
RUN yarn install --frozen-lockfile

# Copy the source code for the backend
COPY apps/backend ./apps/backend

# Use the root tsconfig if it exists, or rely on the app's one. 
# copying everything else in root just in case (e.g. tsconfig.base.json)
COPY . .

# Build the backend application
RUN cd apps/backend && npx prisma generate
RUN yarn workspace backend build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
# We need node_modules for runtime dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

# Copy the built application
# NestJS build output is in dist/
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["yarn", "workspace", "backend", "start:prod"]
