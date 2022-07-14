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

            console.log(`RELAY: got player identity`, sub, name)

            let player = this.createPlayerOnJoin(client, sub, name);

            if (this.playerAlreadyExists(sub)) {
                player = this.handlePlayerReconnection(player, client);
                if (this.playerShouldEnterBattleOnConnect(player)) {
                    this.sendPlayerToBattle(client);
                } else {
                    this.putPlayerInWaitingList(player);
                }
            } else {
                this.handleNewPlayerJoining(player);
                // put the new player in the waiting queue if it is not already in the queue
                this.putPlayerInWaitingList(player);

            }

            this.broadcatsQueue();

            if (this.shouldStartNewGame()) {
                this.startNewGame();
            }
        })

        this.presence.subscribe('battle_state', (state) => {
            if (state === 'endgame') {
                this.state.gameRunning = false;
                this.playingPlayers.clear();
            }
        })


    }

    public onAuth(client: Client, options: any, request: http.IncomingMessage) {
        return true;
    }

    public async onJoin(client: Client, options: any = {}) {
        return true;
    }

    public async onLeave(client: Client, consented: boolean) {

        let p: Player;
        this.state.players.forEach((player, key) => {
            if (player.sessionId === client.sessionId) {
                p = player;
            }
        });

        if (p) {
            p.connected = false;
            this.state.players.set(p.sub, p);

            const leavingWaitingPlayer = this.waitingPlayers.find(waitinggPlayer => waitinggPlayer.sub === p.sub);
            if (leavingWaitingPlayer) {
                leavingWaitingPlayer.connected = false;
            }

            this.broadcatsQueue();
            console.log(`${p.name} left relay`);
        }

    }


    private broadcatsQueue() {
        this.broadcast('queue', this.waitingPlayers.toArray()
            .map(p => `${p.name}|${p.connected}`)
        );
    }

    private startNewGame() {
        this.state.gameRunning = true;

        const waiting = this.waitingPlayers.toArray();
        console.log(`players`, waiting.map(p => p.name));

        const newWaitingPlayersQueue = new Queue<Player>();
        let addedPlayers = 0;

        for (let i = 0; i < PLAYERS_NUM; i++) {
            
            const player = waiting[i];

            if (player.connected) {
                this.playingPlayers.add(player.sub);

                const involvedClient = this.clients.find(client => client.sessionId === player.sessionId)
                involvedClient.send("battle_ready");

                addedPlayers++;
                if (addedPlayers === PLAYERS_NUM) {
                    break;
                }
            } else {
                newWaitingPlayersQueue.enqueue(player);
            }

        }

        this.waitingPlayers = newWaitingPlayersQueue;

    }

    private putPlayerInWaitingList(player: Player) {
        if (!this.waitingPlayers.has(p => p.sub === player.sub)) {
            this.waitingPlayers.enqueue(player);
        }
    }

    private handleNewPlayerJoining(player: Player) {
        this.state.players.set(player.sub, player);
        console.log(`${player.name} joined relay`);
    }

    private sendPlayerToBattle(client: Client) {
        // if it is, tell the player client to reconnect to the game
        client.send("battle_ready", true);
    }

    private playerAlreadyExists(sub: string) {
        return this.state.players.has(sub);
    }

    private playerShouldEnterBattleOnConnect(player: Player) {
        return this.isGameRunning() && this.playingPlayers.has(player.sub);
    }

    private handlePlayerReconnection(player: Player, client: Client) {
        player = this.state.players.get(player.sub);
        player.sessionId = client.sessionId;
        player.connected = true;
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
        return !this.isGameRunning() && this.hasEnoughPlayers() && this.hasEnoughConnectedPlayers();
    }


    private isGameRunning() {
        return this.state.gameRunning;
    }

    private hasEnoughPlayers() {
        return this.waitingPlayers.size() >= PLAYERS_NUM;
    }

    private hasEnoughConnectedPlayers() {
        return this.waitingPlayers.toArray().filter(p => p.connected).length === PLAYERS_NUM;
    }

// Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {
        console.log('onDispose relay');
    }

}

/**
 * Decode a JWT payload
 * https://stackoverflow.com/a/38552302
 * @param  {String} token The JWT
 * @return {Object}       The decoded payload
 */
function parseJWT(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}