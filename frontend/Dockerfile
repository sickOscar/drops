# BUILD
FROM node:alpine
RUN npm i -g pnpm

WORKDIR /app

COPY ./ .
RUN rm .env.local

RUN pnpm i
RUN npm run build

COPY serve.json /app/dist/serve.json
COPY src/assets/logo_square.png /app/dist/assets/logo_square.png

WORKDIR /app/dist

CMD ["npx", "serve", "-p", "7002"]

