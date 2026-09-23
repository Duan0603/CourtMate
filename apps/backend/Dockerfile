# ────────────────────────────────────────────
# Stage 1: Build
# ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy entire monorepo
COPY . .

# Install root deps
RUN npm install --ignore-scripts

# Install backend deps (includes devDeps like typescript)
WORKDIR /app/apps/backend
RUN npm install --ignore-scripts

# Build shared package
WORKDIR /app/packages/shared
RUN npm install --ignore-scripts
RUN npm run build 2>/dev/null || true

# Build backend
WORKDIR /app/apps/backend
RUN ./node_modules/.bin/tsc

# ────────────────────────────────────────────
# Stage 2: Production image
# ────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy monorepo manifests
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install backend production deps only
WORKDIR /app/apps/backend
RUN npm install --omit=dev --ignore-scripts

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy migrations
COPY apps/backend/migrations ./apps/backend/migrations
COPY apps/backend/migrate-mongo-config.js ./apps/backend/migrate-mongo-config.js

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["node", "dist/main.js"]
