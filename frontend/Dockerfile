# BUILD
FROM node:alpine

WORKDIR /app

COPY ./ .

RUN npm i -g pnpm
RUN pnpm i
RUN npm run build

WORKDIR /app/dist

CMD ["npx", "serve", "-p", "7002"]

