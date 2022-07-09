import {Client, Room} from "colyseus";
import {Queue} from "./queue";
import http from "http";
import {Player, RelayState} from "./state";
import {coreListeningSocket} from "./ipc_sockets";
import {restoreTruncatedMessage} from "./message-handling";

const PLAYERS_NUM = 2;

export class DropRelayRoom extends Room<RelayState> { // tslint:disable-line
    public allowReconnectionTime: number = 0;
    autoDispose = false;

    waitingPlayers = new Queue<Player>();
    playingPlayers = new Set<string>();


    public onCreate(_options: Partial<{
        maxClients: number,
        allowReconnectionTime: number,
        metadata: any,
    }>) {
        this.setState(new RelayState());

        let lastRemainingToken = "";
        coreListeningSocket
            .then(socket => socket.on('data', (data) => {

                // more than one message may be mixed on a single send due to how socket is buffered
                const incomingMessages = data.toString().split('\n');

                lastRemainingToken = restoreTruncatedMessage(incomingMessages, lastRemainingToken);

                incomingMessages
                    .filter(message => message.length > 0)
                    .forEach(message => {

                        if (message.startsWith("*endgame:")) {
                            this.state.gameRunning = false;
                        }

                    })
            }));

        this.onMessage("identity", (client, data) => {

            const [sub, name] = data.split(":");

            let player = this.createPlayerOnJoin(client, sub, name);

            if (this.playerAlreadyExists(sub)) {
                player = this.handlePlayerReconnection(player, client);
                if (this.playerShouldEnterBattleOnConnect(player)) {
                    this.sendPlayerToBattle(client);
                }
            } else {
                this.handleNewPlayerJoining(player);
                // put the new player in the waiting queue if it is not already in the queue
                this.putPlayerInWaitingList(player);

            }

            if (this.shouldStartNewGame()) {
                this.startNewGame();
            }
        })

        // this.onMessage('*', (client: Client, type: string, message: any) => {
        //     this.broadcast(type, [client.sessionId, message], { except: client });
        // });
    }

    public onAuth(client: Client, options: any, request: http.IncomingMessage) {
        return true;
    }

    public onJoin(client: Client, options: any = {}) {
    }

    public async onLeave(client: Client, consented: boolean) {

        let p:Player;
        this.state.players.forEach((player, key) => {
            if (player.sessionId === client.sessionId) {
                p = player;
            }
        });

        if (p) {
            console.log(`${p.name} left relay`);
            this.broadcast('player_left', p.name);
        }

    }


    private startNewGame() {
        this.state.gameRunning = true;

        for (let i = 0; i < PLAYERS_NUM; i++) {
            const player = this.waitingPlayers.dequeue();
            this.playingPlayers.add(player.sub);

            this.clients.find(client => client.sessionId === player.sessionId)
                .send("battle_ready");
        }
    }

    private putPlayerInWaitingList(player: Player) {
        if (!this.waitingPlayers.has(p => p.sub === player.sub)) {
            this.waitingPlayers.enqueue(player);
        }
    }

    private handleNewPlayerJoining(player: Player) {
        this.state.players.set(player.sub, player);
        console.log(`${player.name} joined relay`);
        this.broadcast('player_joined', player.name);
    }

    private sendPlayerToBattle(client: Client) {
        // if it is, tell the player client to reconnect to the game
        client.send("battle_ready", true);
    }

    private playerAlreadyExists(sub: string) {
        return this.state.players.has(sub);
    }

    private playerShouldEnterBattleOnConnect(player: Player) {
        return this.state.gameRunning && this.playingPlayers.has(player.sub);
    }

    private handlePlayerReconnection(player: Player, client: Client) {
        player = this.state.players.get(player.sub);
        player.sessionId = client.sessionId;
        console.log(`${player.name} reconnected`);
        return player;
    }

    private createPlayerOnJoin(client: Client, sub, name) {
        let player = new Player();
        player.connected = true;
        player.sessionId = client.sessionId;
        player.sub = sub;
        player.name = name;
        return player;
    }

    private shouldStartNewGame() {
        return !this.state.gameRunning && this.waitingPlayers.size() >= PLAYERS_NUM;
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