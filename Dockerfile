# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install all dependencies (required for build)
RUN npm install

# Copy application source code
COPY . .

# Build the frontend and backend bundle
RUN npm run build

# Stage 2: Create the production image
FROM node:22-alpine AS runner

WORKDIR /app

# Enforce production mode
ENV NODE_ENV=production
ENV PORT=3000

# Copy package.json
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist

# Create a non-root user for enhanced security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose the standard port for Cloud Run
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
