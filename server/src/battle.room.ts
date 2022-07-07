import http from "http";
import { Room, Client } from "colyseus";
import {Field, FieldCol, RoomState} from "./state";

import {coreSendingSocket, coreListeningSocket} from "./ipc_sockets";

export class BattleRoom extends Room {

    autoDispose = false;

    playerMapping:{[sub:string]: number} = {}
    static polayerIndex = 1;

    // When room is initialized
    onCreate (options: any) {
        console.log('onCreateBattle');
        this.setState(new RoomState());

        let lastRemainingToken = "";

        coreListeningSocket.then(socket => socket.on('data', (data) => {

                const fieldStrings = data.toString().split('\n');
                if (fieldStrings[0] && !(fieldStrings[0].startsWith("*"))) {
                    fieldStrings[0] = lastRemainingToken + fieldStrings[0];
                    lastRemainingToken = "";
                }

                if (fieldStrings[fieldStrings.length - 1] && !(fieldStrings[fieldStrings.length - 1].endsWith("|"))) {
                    lastRemainingToken = fieldStrings[fieldStrings.length - 1];
                    fieldStrings.pop();
                }

                const validFieldStrings = fieldStrings
                    .filter(fieldString => fieldString.length > 0)
                    .map(fieldString => `${fieldString.substring(1)}`)

                for (let fieldString of validFieldStrings) {
                    try {
                        
                        // console.log(`fieldString`, fieldString)
                        
                        const receivedField = JSON.parse(fieldString)

                        const field = new Field();
                        field.cols = receivedField.map(cols => {
                            const col = new FieldCol();
                            col.col = cols.map(cell => cell);
                            return col;
                        });

                        this.state.field = field;

                    } catch (err) {
                        console.log("Error parsing core data: " + err);
                    }
                }

        }))

    }

    // Authorize client based on provided options before WebSocket handshake is complete
    onAuth (client: Client, options: any, request: http.IncomingMessage) {
        console.log('onAuth');
        return true;
    }

    // When client successfully join the room
    async onJoin (client: Client, options: any, auth: any) {
        console.log(`${client.sessionId} joined battle `);


        if (!this.playerMapping[options.sub]) {
            console.log(`options.sub`, options.sub)
            this.playerMapping[options.sub] = BattleRoom.polayerIndex;
            BattleRoom.polayerIndex++;
        }

        if (this.clients.length === 2) {
            this.broadcast('battle_start');

            coreSendingSocket.then(socket => {
                const playerIds = Object.values(this.playerMapping);
                socket.write(`play:${playerIds.join('|')}`);
            })

        }

        this.onMessage("action", (client:Client, message: String) => {
            // console.log(`action`, message);

            const playerId = this.playerMapping[options.sub];

            coreSendingSocket.then(socket => {
                const toSend = `|${playerId}|(${message})\n`;
                console.log(`toSend`, toSend)
                socket.write(toSend);

            })

        })

        // (await coreSendingSocket).write(`|1|(${Math.random()},${Math.random()},${Math.random()})\n`);
    }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) {
        console.log('onLeave');
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () {
        console.log('onDispose battle');
    }

}