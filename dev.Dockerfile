FROM node:20.11-alpine

WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install

COPY src ./src
COPY public ./public
COPY components.json .
COPY next.config.js .
COPY nodemon.json .
COPY postcss.config.js .
COPY tailwind.config.ts .
COPY tsconfig.json .
COPY tsconfig.server.json .

CMD ["yarn", "dev"]
