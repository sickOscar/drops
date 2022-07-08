import http from "http";
import {Client, Room} from "colyseus";
import {Field, FieldCol, GameState, Player} from "./state";

import {coreListeningSocket, coreSendingSocket} from "./ipc_sockets";
import {restoreTruncatedMessage} from "./message-handling";


export class BattleRoom extends Room<GameState> {

    autoDispose = false;

    static playerIndex = 1;

    // When room is initialized
    onCreate(options: any) {
        this.setState(new GameState());

        let lastRemainingToken = "";

        coreListeningSocket
            .then(socket => socket.on('data', (data) => {

                // more than one message may be mixed on a single send due to how socket is buffered
                const incomingMessages = data.toString().split('\n');

                lastRemainingToken = restoreTruncatedMessage(incomingMessages, lastRemainingToken);

                // console.log(`incomingMessage`, incomingMessages)

                incomingMessages
                    .filter(message => message.length > 0)
                    .forEach(message => {



                        // remove trailing |
                        message = message.slice(0, -1);


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

                                    const newPlayer = this.state.players.get(player.sub);
                                    newPlayer.resources = parsedPlayer.resources;
                                    newPlayer.score = parsedPlayer.owned_cells;

                                    this.state.players.set(player.sub, newPlayer)

                                })
                            return;

                        }

                        if (message.startsWith("*field:")) {

                            const fieldString = message.substring("*field:".length);
                            const receivedField = JSON.parse(fieldString)

                            const field = new Field();
                            field.cols = receivedField.map(cols => {
                                const col = new FieldCol();
                                col.col = cols.map(cell => cell);
                                return col;
                            });

                            this.state.field = field;

                            return null;
                        }

                        if (message.startsWith("*endgame")) {
                            this.state.gameRunning = false;
                            this.broadcast('endgame');
                            return;
                        }

                    })


            }))


        this.onMessage("action", (client: Client, message: String) => {

            const player = this.getPlayerBySessionId(client);

            coreSendingSocket.then(socket => {
                const toSend = `|${player.id}|(${message})`;
                console.log(`toSend`, toSend)
                socket.write(`${toSend}\n`);

            })

        })

        this.onMessage("identity", (client, data) => {

            const [sub, name] = data.split(":");

            let player = BattleRoom.createPlayerOnJoin(client, sub, name);

            if (this.playerAlreadyExists(sub)) {
                player = this.handlePlayerReconnection(player, client);
            } else {
                this.handleNewPlayerJoining(player);
            }

            if (this.clients.length === 2) {
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
        })

    }

    private getPlayerBySessionId(client: Client) {
        let p: Player;
        this.state.players.forEach((player, key) => {
            if (player.sessionId === client.sessionId) {
                p = player;
            }
        })
        return p;
    }

// Authorize client based on provided options before WebSocket handshake is complete
    onAuth(client: Client, options: any, request: http.IncomingMessage) {
        return true;
    }

    // When client successfully join the room
    async onJoin(client: Client, options: any, auth: any) {
        // (await coreSendingSocket).write(`|1|(${Math.random()},${Math.random()},${Math.random()})\n`);
    }

    // When a client leaves the room
    onLeave(client: Client, consented: boolean) {
        let p:Player;
        this.state.players.forEach((player, key) => {
            if (player.sessionId === client.sessionId) {
                p = player;
            }
        });

        if (p) {
            console.log(`${p.name} left battle`);
            this.broadcast('player_left', p.name);
        }
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {
        console.log('onDispose battle');
    }

    private playerAlreadyExists(sub: string) {
        return this.state.players.has(sub);
    }

    private handlePlayerReconnection(player: Player, client: Client) {
        player = this.state.players.get(player.sub);
        player.sessionId = client.sessionId;
        console.log(`${player.name} back to battle`);
        return player;
    }

    private static createPlayerOnJoin(client: Client, sub, name) {
        let player = new Player();
        player.id = BattleRoom.playerIndex++;
        player.connected = true;
        player.sessionId = client.sessionId;
        player.sub = sub;
        player.name = name;
        return player;
    }

    private handleNewPlayerJoining(player: Player) {
        this.state.players.set(player.sub, player);
        console.log(`${player.name} joined battle`);
        this.broadcast('player_joined', player.name);
    }

}

