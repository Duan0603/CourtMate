# ────────────────────────────────────────────
# Stage 1: Build
# ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install all deps (including devDeps for build)
RUN npm ci --ignore-scripts

# Copy source
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build 2>/dev/null || true

# Build backend
WORKDIR /app/apps/backend
RUN npm run build

# ────────────────────────────────────────────
# Stage 2: Production image
# ────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy monorepo manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install only production deps
RUN npm ci --omit=dev --ignore-scripts

# Copy built artifacts from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy migrations
COPY apps/backend/migrations ./apps/backend/migrations
COPY apps/backend/migrate-mongo-config.js ./apps/backend/migrate-mongo-config.js

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["node", "dist/main.js"]
