import {LobbyRoom, matchMaker, Server} from "colyseus";
import {BattleRoom} from "./src/battle.room";
import http from "http";
import {WebSocketTransport} from "@colyseus/ws-transport"
import {DropRelayRoom} from "./src/relay.room";
import {enhanced_logging} from "./src/logging";
import express from "express";
import {Server as SocketIoServer} from "socket.io"
import {Globals} from "./src/global";

const multiplayerServerPort = Number(process.env.port) || 7000;
const viewerServerPort = Number(process.env.port) || 7001;


async function startGameServer() {

  const gameServer = new Server({
    // server: createServer(app),
    transport: new WebSocketTransport({})
  });

  gameServer.define('battle', BattleRoom);
  gameServer.define('relay', DropRelayRoom);

  const relay = await matchMaker.createRoom('relay', {});
  const battle = await matchMaker.createRoom("battle", { /* options */});

  enhanced_logging(relay, battle);

  return gameServer.listen(multiplayerServerPort)
}

async function startViewerServer() {
  const app = express();
  app.use(express.json());
  const server = http.createServer(app);
  const socketPath = process.env.NODE_ENV === 'production' ? "/viewersocket/socket.io" : ""
  console.log(`socketPath`, socketPath)
  const io = new SocketIoServer(server, {
    path: socketPath,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', socket => {
    console.log('viewer connected');
    Globals.viewerSocket = socket;
  })

  return server.listen(viewerServerPort);
}

startViewerServer()
  .then(() => {
    console.log(`Viewer on ws://localhost:${viewerServerPort}`);
  })

startGameServer()
  .then(() => {
    console.log(`Server started on port ${multiplayerServerPort}`);
  })

