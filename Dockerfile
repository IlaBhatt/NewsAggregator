# Unified Dockerfile - Builds both frontend and backend
# Backend Express server serves React static files
# No nginx required!

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build React app
RUN npm run build
# Output: /frontend/dist/

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy backend source
COPY backend/ ./

# Build TypeScript
RUN npm run build
# Output: /app/dist/

# Stage 3: Production - Single unified container
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built backend from builder stage
COPY --from=backend-builder --chown=nodejs:nodejs /app/dist ./dist

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder --chown=nodejs:nodejs /frontend/dist ./frontend/dist

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]
