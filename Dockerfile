# Use Node.js image as a base
FROM node:20.11-alpine AS base

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat vips vips-dev python3 make g++ pkgconfig

RUN mkdir -p /app/dist/media && chmod 777 /app/dist/media

FROM base AS builder
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile
RUN yarn add sharp

# Copy the full project, including pages/app directory, public folder, etc.
COPY . .

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
ARG NEXT_PUBLIC_UPSTASH_REDIS_REST_URL
ARG NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN

# Build the Next.js project
RUN yarn build

RUN yarn postbuild

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system nodejs && adduser --system --ingroup nodejs nextjs

RUN mkdir -p /app/.next/cache/images && \
    mkdir -p /app/dist/media && \
    chown -R nextjs:nodejs /app/dist/media && \
    chmod -R 777 /app/dist/media

# Copy the necessary build outputs and node_modules from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/build/ ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/ ./dist
COPY --from=builder /app/next.config.mjs ./

RUN mkdir -p /app/dist/product_files
RUN chown -R nextjs:nodejs /app/dist/product_files
RUN chmod -R 755 /app/dist/product_files

# Set ownership for caching directories
RUN chown -R nextjs:nodejs /app/.next/cache
RUN chown -R nextjs:nodejs /app/.next/static

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
ARG NEXT_PUBLIC_UPSTASH_REDIS_REST_URL
ENV NEXT_PUBLIC_UPSTASH_REDIS_REST_URL=${NEXT_PUBLIC_UPSTASH_REDIS_REST_URL}
ARG NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN
ENV NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN=${NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN}

ENV PAYLOAD_CONFIG_PATH=/app/dist/payload.config.js
ENV NEXT_SHARP_PATH=/app/node_modules/sharp
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Run the Next.js application using the built server
CMD ["node", "dist/server.js"]
