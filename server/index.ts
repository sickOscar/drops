import {LobbyRoom, RelayRoom, Server, matchMaker} from "colyseus";
import {BattleRoom} from "./src/battle.room";
import {createServer} from "http";
import { WebSocketTransport } from "@colyseus/ws-transport"
import {DropRelayRoom} from "./src/relay.room";
import {enhanced_logging} from "./src/logging";
import express from "express";

const port = Number(process.env.port) || 7000;


async function startGameServer() {

    const app = express();
    app.use(express.json());

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


    return gameServer.listen(port)
}



startGameServer()
    .then(() => {
        console.log(`Server started on port ${port}`);
    })

