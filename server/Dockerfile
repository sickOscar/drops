# build
FROM node:alpine

VOLUME /sockets

COPY . /server
WORKDIR /server

RUN npm install
CMD ["npm", "start"]