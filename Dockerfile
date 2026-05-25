# ─────────────────────────────────────────────────────────────────────────────
#  Stage 1 — Dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

# ─────────────────────────────────────────────────────────────────────────────
#  Stage 2 — Builder (includes dev deps for testing)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# ─────────────────────────────────────────────────────────────────────────────
#  Stage 3 — Production Image
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser  -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:appgroup src/ ./src/
COPY --chown=appuser:appgroup package*.json ./

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Use dumb-init to handle PID 1 and signal forwarding properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
