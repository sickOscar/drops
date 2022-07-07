import {Context, defineTypes, MapSchema, Schema, type} from '@colyseus/schema';
import {Client, Room} from "colyseus";
import {Queue} from "./queue";
import http from "http";

/**
 * Create another context to avoid these types from being in the user's global `Context`
 */
const context = new Context();

class Player extends Schema { // tslint:disable-line
    public id: number;
    public connected: boolean;
    public token: string;
    public name: boolean;
    public sessionId: string;
}
defineTypes(Player, {
    id: 'int32',
    connected: 'boolean',
    token: 'string',
    name: 'string',
    sessionId: 'string',
}, context);

class State extends Schema { // tslint:disable-line
    public players = new MapSchema<Player>();
}
defineTypes(State, {
    players: { map: Player },
}, context);


export class DropRelayRoom extends Room<State> { // tslint:disable-line
    public allowReconnectionTime: number = 0;
    autoDispose = false;

    playersQueue = new Queue();

    public onCreate(options: Partial<{
        maxClients: number,
        allowReconnectionTime: number,
        metadata: any,
    }>) {
        this.setState(new State());

        if (options.maxClients) {
            this.maxClients = options.maxClients;
        }

        if (options.allowReconnectionTime) {
            this.allowReconnectionTime = Math.min(options.allowReconnectionTime, 40);
        }

        if (options.metadata) {
            this.setMetadata(options.metadata);
        }

        // this.onMessage('*', (client: Client, type: string, message: any) => {
        //     this.broadcast(type, [client.sessionId, message], { except: client });
        // });
    }

    public onAuth(client: Client, options: any, request: http.IncomingMessage) {
        console.log('onAuth relay');

        return true;

    }

    public onJoin(client: Client, options: any = {}) {
        const player = new Player();

        player.connected = true;
        player.sessionId = client.sessionId;
        player.name = options.name;

        this.state.players.set(client.sessionId, player);

        console.log(`${player.name} joined relay`);

        this.broadcast('player_joined', [client.sessionId, player.name]);
        this.playersQueue.enqueue(player);

        if (this.playersQueue.size() > 1) {
            this.playersQueue.purge();
            this.broadcast('battle_ready');
        }

    }

    public async onLeave(client: Client, consented: boolean) {
        const player = this.state.players.get(client.sessionId);
        console.log(`${player.name} left`);

        player.connected = false;
        this.state.players.delete(client.sessionId);
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () {
        console.log('onDispose relay');
    }

}

/**
 * Decode a JWT payload
 * https://stackoverflow.com/a/38552302
 * @param  {String} token The JWT
 * @return {Object}       The decoded payload
 */
function parseJWT (token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}