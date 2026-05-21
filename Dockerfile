# ─────────────────────────────────────────────────────────────
#  Dockerfile — Single container: builds Ionic + runs Node server
#  Multi-stage: keeps final image small (~200MB vs ~1.5GB)
# ─────────────────────────────────────────────────────────────

# ── Stage 1: Build Ionic Angular frontend ─────────────────────
FROM node:20-alpine AS builder

WORKDIR /build/webapp

# Install deps first (layer cache — only re-runs when package.json changes)
COPY webapp/package*.json ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY webapp/ ./
RUN npx ionic build --prod

# ── Stage 2: Node.js production server ────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install only production deps
COPY server/package*.json ./
RUN npm install --omit=dev

# Copy server source
COPY server/ ./

# Copy built Ionic app into server/public (where Express serves it)
COPY --from=builder /build/webapp/www ./public

# Non-root user for OpenShift compatibility (OpenShift uses random UIDs)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
