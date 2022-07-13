import http from "http";
import {Client, Room} from "colyseus";
import {Field, FieldCol, GameState, Player} from "./state";
import {Globals} from "./global";
import {coreListeningSocket, coreSendingSocket} from "./ipc_sockets";
import {restoreTruncatedMessage} from "./message-handling";


const PLAYERS_NUM = 2;

export class BattleRoom extends Room<GameState> {

    autoDispose = false;

    static playerIndex = 1;

    // When room is initialized
    async onCreate(options: any) {
        this.setState(new GameState());

        let lastRemainingToken = "";

        const socket = await coreListeningSocket
        socket.on('data', (data) => {

            // more than one message may be mixed on a single send due to how socket is buffered
            const incomingMessages = data.toString().split('\n');

            lastRemainingToken = restoreTruncatedMessage(incomingMessages, lastRemainingToken);

            // console.log(`incomingMessage`, incomingMessages)

            incomingMessages
                .filter(message => message.length > 0)
                .forEach(message => {

                    // remove trailing |
                    message = message.slice(0, -1);

                    // console.log(`message`, message)

                    if (message.startsWith("*players:")) {
                        const playersString = message.substring("*players:".length);
                        playersString.split('/')
                            .forEach(playerString => {
                                const parsedPlayer:any = JSON.parse(playerString);
                                let player:Player;
                                this.state.players.forEach((p, key) => {
                                    if (p.id === parsedPlayer.id) {
                                        player = p;
                                    }
                                });

                                if (player) {
                                    const newPlayer = this.state.players.get(player.sessionId);
                                    newPlayer.resources = parsedPlayer.resources;
                                    newPlayer.score = parsedPlayer.owned_cells;
                                    newPlayer.development = parsedPlayer.development;
                                    newPlayer.milestones_reached = parsedPlayer.milestones_reached;
                                    this.state.players.set(player.sessionId, newPlayer)
                                }



                            })
                        return;

                    }

                    if (message.startsWith("*field:")) {

                        const socket = Globals.viewerSocket;

                        if (!socket) {
                            // ...
                            return;
                        }

                        socket.emit('field', message.substring("*field:".length));


                        // const fieldString = message.substring("*field:".length);
                        // const receivedField = JSON.parse(fieldString)
                        //
                        // const field = new Field();
                        // field.cols = receivedField.map(cols => {
                        //     const col = new FieldCol();
                        //     col.col = cols.map(cell => cell);
                        //     return col;
                        // });
                        //
                        // this.state.field = field;

                        return null;
                    }

                    if (message.startsWith("*endgame")) {
                        console.log('ENDGAME')
                        this.state.gameRunning = false;
                        this.broadcast('endgame');

                        this.state.players.clear();

                        this.presence.publish('battle_state', 'endgame');

                    }

                })


        })


        this.onMessage("action", (client: Client, message: String) => {

            const player = this.state.players.get(client.sessionId);

            coreSendingSocket.then(socket => {
                const toSend = `|${player.id}|(${message})`;
                console.log(`toSend`, toSend)
                socket.write(`${toSend}\n`);

            })

        })

        this.onMessage("identity", (client, data) => {

            const [sub, name] = data.split(":");
            console.log(`got player identity`, sub, name);

            let existingPlayer:Player;
            this.state.players.forEach((p, key) => {
                if (p.sub === sub) {
                    existingPlayer = p;
                }
            })
            

            if (existingPlayer) {

                this.state.players.delete(existingPlayer.sessionId);

                this.state.players.get(client.sessionId).id = existingPlayer.id;
                this.state.players.get(client.sessionId).name = name;
                this.state.players.get(client.sessionId).sub = sub;

                client.send('battle_start');

            } else {

                this.state.players.get(client.sessionId).name = name;
                this.state.players.get(client.sessionId).sub = sub;

                client.send(this.state.players.size);

                if (this.state.players.size === PLAYERS_NUM) {
                    this.broadcast('battle_start');

                    if (!this.state.gameRunning) {

                        this.state.gameRunning = true;

                        coreSendingSocket.then(socket => {
                            const playerIds = [];
                            this.state.players.forEach(player => {
                                playerIds.push(player.id);
                            })
                            const startingString = `play:${playerIds.join('|')}`;
                            console.log(`Starting game : ${startingString}`)
                            socket.write(startingString);
                        })
                    }

                }

            }

        })

    }


// Authorize client based on provided options before WebSocket handshake is complete
    onAuth(client: Client, options: any, request: http.IncomingMessage) {
        return true;
    }

    // When client successfully join the room
    async onJoin(client: Client, options: any, auth: any) {

        const player = new Player();
        player.id = BattleRoom.playerIndex++;
        player.sessionId = client.sessionId;
        this.state.players.set(client.sessionId, player);

    }

    // When a client leaves the room
    async onLeave(client: Client, consented: boolean) {
        const player = this.state.players.get(client.sessionId);
        player.connected = false;

        try {
            if (consented) {
                throw new Error("consented leave");
            }

            // allow disconnected client to reconnect into this room until 20 seconds
            await this.allowReconnection(client, 60);

            // client returned! let's re-activate it.
            player.connected = true;

        } catch (e) {
            console.log(`client disconnected nd removed`, player.sessionId);
            // this.broadcast('player_left', player.name);
            // this.state.players.delete(client.sessionId);
        }

    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {
        console.log('onDispose battle');
    }



}

