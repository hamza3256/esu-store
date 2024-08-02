FROM node:20.11-alpine AS base

WORKDIR /app

RUN apk add --no-cache libc6-compat vips vips-dev python3 make g++ pkgconfig

FROM base AS builder
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system nodejs && adduser --system --ingroup nodejs nextjs

# allow permission to access images
RUN mkdir -p /app/.next/cache/images

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/cache ./.next/cache

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build/ ./build
COPY --from=builder /app/dist/ ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./ 
 
RUN chown -R nextjs:nodejs /app/.next/cache
RUN chown -R nextjs:nodejs /app/.next/static

USER nextjs

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

ENV PAYLOAD_CONFIG_PATH=/app/payload.config.js
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
