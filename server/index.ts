import {LobbyRoom, RelayRoom, Server, matchMaker} from "colyseus";
import {BattleRoom} from "./src/battle.room";
import http, {createServer} from "http";
import { WebSocketTransport } from "@colyseus/ws-transport"
import {DropRelayRoom} from "./src/relay.room";
import {enhanced_logging} from "./src/logging";
import express from "express";
import cors from 'cors';
import {Server as SocketIoServer} from "socket.io"
import {Globals} from "./src/global";

const multiplayerServerPort = Number(process.env.port) || 7000;
const viewerServerPort = Number(process.env.port) || 7001;



async function startGameServer() {

    const gameServer = new Server({
        // server: createServer(app),
        transport: new WebSocketTransport({})
    });

    // app.get("/", (req, res) => {
    //     res.send("Hello World!");
    // })

    gameServer.define('battle', BattleRoom);
    gameServer.define('lobby', LobbyRoom);
    gameServer.define('relay', DropRelayRoom);

    const relay = await matchMaker.createRoom('relay', {});
    const battle = await matchMaker.createRoom("battle", { /* options */ });

    enhanced_logging(relay, battle);


    return gameServer.listen(multiplayerServerPort)
}


async function startViewerServer() {
    const app = express();
    app.use(express.json());
    const server = http.createServer(app);
    const io = new SocketIoServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', socket => {
        console.log('viewer connected');
        Globals.viewerSocket = socket;
        socket.emit('field', "test");

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

