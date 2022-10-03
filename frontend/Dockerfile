# BUILD
FROM node:alpine
RUN npm i -g pnpm

WORKDIR /app

COPY ./ .
RUN rm .env.local
RUN echo "VITE_MULTIPLAYER_HOST_GAME=wss://d2bz1cokb81olu.cloudfront.net/server" > .env.production
RUN echo "VITE_MULTIPLAYER_HOST_VIEWER=wss://d2bz1cokb81olu.cloudfront.net" >> .env.production
RUN pnpm i
RUN npm run build

COPY serve.json /app/dist/serve.json
COPY src/assets/logo_square.png /app/dist/assets/logo_square.png
COPY src/assets/drone.png /app/dist/assets/drone.png

WORKDIR /app/dist

CMD ["npx", "serve", "-p", "7002"]

