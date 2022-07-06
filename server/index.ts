import {Server} from "colyseus";
import {createServer} from "http";
import express from "express";
import {BattleRoom} from "./src/battle.room";
import { WebSocketTransport } from "@colyseus/ws-transport"

const port = Number(process.env.port) || 7000;

function startGameServer() {

    // const app = express();
    // app.use(express.json());

    const gameServer = new Server({
        // server: createServer(app),
        transport: new WebSocketTransport({})
    });

    gameServer.define('battle', BattleRoom)

    return gameServer.listen(port)
}



startGameServer()
    .then(() => {
        console.log(`Server started on port ${port}`);
    })

