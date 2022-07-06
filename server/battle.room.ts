import http from "http";
import { Room, Client } from "colyseus";

export class BattleRoom extends Room {
    // When room is initialized
    onCreate (options: any) {
        console.log('onCreate');
    }

    // Authorize client based on provided options before WebSocket handshake is complete
    onAuth (client: Client, options: any, request: http.IncomingMessage) {
        console.log('onAuth');
        return true;
    }

    // When client successfully join the room
    onJoin (client: Client, options: any, auth: any) {
        console.log('onJoin');
    }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) {
        console.log('onLeave');
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () {
        console.log('onDispose');
    }

}