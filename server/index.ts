import {LobbyRoom, RelayRoom, Server, matchMaker} from "colyseus";
import {createServer} from "http";
import express from "express";
import {BattleRoom} from "./src/battle.room";
import { WebSocketTransport } from "@colyseus/ws-transport"
import {coreListeningSocket, coreSendingSocket} from "./src/ipc_sockets";
import {DropRelayRoom} from "./src/relay.room";

const port = Number(process.env.port) || 7000;

async function startGameServer() {

    // const app = express();
    // app.use(express.json());

    const gameServer = new Server({
        // server: createServer(app),
        transport: new WebSocketTransport({})
    });

    gameServer.define('battle', BattleRoom);
    gameServer.define('lobby', LobbyRoom);
    gameServer.define('relay', DropRelayRoom);

    matchMaker.createRoom('relay', {}).then(room => {
        console.log('created relay room');
    })
    matchMaker.createRoom("battle", { /* options */ })
        .then(room => {
            console.log('created battle room');
        })

    return gameServer.listen(port)
}



startGameServer()
    .then(() => {
        console.log(`Server started on port ${port}`);

        // setTimeout(() => {
        //     (coreSendingSocket).then((s) => {
        //         console.log('Sending play message')
        //         s.write("play|1|2|3")
        //     })
        // }, 5000);
        //
        // setTimeout(() => {
        //     (coreSendingSocket).then((s) => {
        //         console.log('Sending play message')
        //         s.write("play|1|2|3|6|7|36|29|34")
        //     })
        // }, 20000);


    })

