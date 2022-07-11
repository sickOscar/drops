# build
FROM node:alpine

VOLUME /tmp/sockets

COPY . /server
WORKDIR /server

RUN npm install

CMD ["npm", "start"]