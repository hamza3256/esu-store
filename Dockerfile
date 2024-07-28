# Use official Node.js runtime as a parent image
FROM node:20.11-alpine AS base

# Set working directory
WORKDIR /app

# Install necessary dependencies including vips and sharp dependencies
RUN apk add --no-cache libc6-compat vips vips-dev python3 make g++ pkgconfig \
  && apk add --no-cache --virtual .build-deps build-base curl

# Stage 1: Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Install sharp with specific platform and architecture options
RUN yarn add --platform=linuxmusl --arch=x64 sharp --verbose

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# Copy all necessary files for the build
COPY src ./src
COPY public ./public
COPY components.json .
COPY next.config.mjs .
COPY nodemon.json .
COPY postcss.config.cjs .
COPY tailwind.config.ts .
COPY tsconfig.json .
COPY tsconfig.server.json .
COPY .env .env
COPY package.json .

# Pass build arguments and set environment variables
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

# Build the application
RUN yarn build

# Ensure the necessary directories exist
RUN mkdir -p /app/.next/cache/images

# Stage 3: Create the final image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create necessary user and group
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy necessary files for production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Set permissions after user creation
RUN chown -R nextjs:nodejs /app/.next/cache

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "dist/server.js"]
