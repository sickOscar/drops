import {LobbyRoom, RelayRoom, Server, matchMaker} from "colyseus";
import {BattleRoom} from "./src/battle.room";
import { WebSocketTransport } from "@colyseus/ws-transport"
import {DropRelayRoom} from "./src/relay.room";
import {enhanced_logging} from "./src/logging";

const port = Number(process.env.port) || 7000;



async function startGameServer() {

    const gameServer = new Server({
        transport: new WebSocketTransport({})
    });

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

