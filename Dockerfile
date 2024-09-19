# Use Node.js image as a base
FROM node:20.11-alpine AS base

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat vips vips-dev python3 make g++ pkgconfig

# Create media directory with appropriate permissions
RUN mkdir -p /app/dist/media && chmod 777 /app/dist/media

# Install system dependencies
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install project dependencies
RUN yarn install --frozen-lockfile

# Copy the entire project
COPY . .

# Build the Next.js project
RUN yarn build

# Final production image
FROM base AS runner

# Set working directory
WORKDIR /app

# Set environment variable to production
ENV NODE_ENV production

# Add non-root user for security
RUN addgroup --system nodejs && adduser --system --ingroup nodejs nextjs

# Ensure required directories exist with appropriate permissions
RUN mkdir -p /app/.next/cache/images && \
    mkdir -p /app/dist/media && \
    chown -R nextjs:nodejs /app/dist/media && \
    chmod -R 777 /app/dist/media

# Copy necessary build outputs and node_modules from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/build/ ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/ ./dist
COPY --from=builder /app/next.config.mjs ./

# Set ownership for caching directories
RUN chown -R nextjs:nodejs /app/.next/cache && \
    chown -R nextjs:nodejs /app/.next/static

# Use non-root user
USER nextjs

# Environment variables
ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ARG PAYLOAD_SECRET
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}
ARG RESEND_API_KEY
ENV RESEND_API_KEY=${RESEND_API_KEY}
ARG STRIPE_SECRET_KEY
ENV STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
ARG STRIPE_CUSTOM_TRANSACTION_FEE
ENV STRIPE_CUSTOM_TRANSACTION_FEE=${STRIPE_CUSTOM_TRANSACTION_FEE}
ARG STRIPE_WEBHOOK_SECRET
ENV STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
ARG EMAIL_FROM_ADDRESS
ENV EMAIL_FROM_ADDRESS=${EMAIL_FROM_ADDRESS}
ARG MONGODB_PORT
ENV MONGODB_PORT=${MONGODB_PORT}

# Additional environment variables for Payload CMS and Next.js
ENV PAYLOAD_CONFIG_PATH=/app/dist/payload.config.js
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

# Expose the application port
EXPOSE PORT

# Start the application
CMD ["node", "dist/server.js"]
