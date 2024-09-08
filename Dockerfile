# Use a lightweight Node.js image
FROM node:20.11-alpine AS base

WORKDIR /app

# Install only necessary packages
RUN apk add --no-cache libc6-compat vips vips-dev python3 make g++ pkgconfig

# Create a build stage
FROM base AS builder
WORKDIR /app

# Copy only necessary files for dependency installation
COPY package.json yarn.lock* ./

# Install all dependencies, including devDependencies, for the build process
RUN yarn install --frozen-lockfile

# Copy the remaining project files
COPY . .

# Set environment variables required for the build process
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_APP_URL
ARG PAYLOAD_SECRET
ARG MONGODB_URI
ARG RESEND_API_KEY
ARG STRIPE_SECRET_KEY
ARG STRIPE_CUSTOM_TRANSACTION_FEE
ARG STRIPE_WEBHOOK_SECRET
ARG EMAIL_FROM_ADDRESS
ARG MONGODB_PORT

# Set Payload config path for the build
ARG PAYLOAD_CONFIG_PATH
ENV PAYLOAD_CONFIG_PATH=src/payload.config.ts

# Build the application (this will output files into the `dist` folder)
RUN yarn build

# Final production image
FROM node:20.11-alpine AS runner
WORKDIR /app

# Install only production dependencies
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production

# Copy the necessary build artifacts from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Set the environment to production
ENV NODE_ENV=production

# Add a non-root user
RUN addgroup --system nodejs && adduser --system --ingroup nodejs nextjs

# Set permissions for the necessary directories
RUN chown -R nextjs:nodejs /app/dist

USER nextjs

# Set environment variables for runtime
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ENV MONGODB_URI=${MONGODB_URI}
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
ENV STRIPE_CUSTOM_TRANSACTION_FEE=${STRIPE_CUSTOM_TRANSACTION_FEE}
ENV STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
ENV EMAIL_FROM_ADDRESS=${EMAIL_FROM_ADDRESS}
ENV MONGODB_PORT=${MONGODB_PORT}

# Set additional environment variables
ENV PAYLOAD_CONFIG_PATH=/app/payload.config.js
ENV NEXT_SHARP_PATH=/app/node_modules/sharp
ENV HOSTNAME="0.0.0.0"

# Expose port 8080
EXPOSE 8080

# Start the application
# CMD ["node", "--max-old-space-size=512", "dist/server.js"]
CMD ["yarn", "start"]