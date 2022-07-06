import * as net from "net";
import * as fs from "fs";
import {Server} from "colyseus";
import { createServer } from "http";
import express from "express";
import {BattleRoom} from "./battle.room";
const port = Number(process.env.port) || 7000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SOCKET_TO_NODE = "/tmp/drops_to_node.sock";
const SOCKET_FROM_NODE = "/tmp/drops_from_node.sock";

let rustSocket = null;

function startSendingSocket() {

    fs.stat(SOCKET_FROM_NODE, function (err, stats) {
        if (err) {
            // start server
            console.log('No leftover socket found.');
            return connectToSendingSocket()
                .catch(async () => {
                    await sleep(1000);
                    return startSendingSocket()
                })
        }
        // remove file then start server
        console.log('Removing leftover socket.')
        fs.unlink(SOCKET_FROM_NODE, function(err){
            if(err){
                // This should never happen.
                console.error(err); process.exit(0);
            }
            return connectToSendingSocket()
                .catch(async () => {
                    await sleep(1000);
                    return startSendingSocket()
                })
        });
    });
}

function startListeningSocket(): Promise<void> {

    return connectToListeningSocket()
        .catch(async () => {
            await sleep(1000);
            return startListeningSocket()
        })
}

function connectToSendingSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
        const server = net.createServer(function (socket) {
            console.log('Connection acknowledged.');
        });

        server.listen(SOCKET_FROM_NODE, function () {
            console.log('Sending socket listening on ' + SOCKET_FROM_NODE);
            resolve();
        })
            .on("connection", function (socket) {
                console.log('CORE connected');
                // HERE DATA GOES TO RUST
                rustSocket = socket;


                // setInterval(() => {
                //     // console.log("Sending data...")
                //     const military = Math.random();
                //     const production = Math.random();
                //     const research = Math.random();
                //     socket.write(`1|(${military},${production},${research})\n`);
                // }, 100)
            })
            .on("error", function (err) {
                console.log('Sending socket error: ' + err);
                reject(err);
            })
    })

}

function connectToListeningSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
        const client = net.createConnection(SOCKET_TO_NODE)
            .on('connect', () => {
                console.log('Connected to drops server');
            })
            .on('data', (data) => {

                // HERE DATA ARRIVES FROM RUST
                handleCoreData(data);


            })
            .on('disconnect', () => {
                console.log('Disconnected from drops server');
                reject();
            })
            .on('error', (err) => {
                // console.log('Error: ' + err);
                reject(err)
            })
            .on('close', (hadErr) => {
                // console.log('Closed: ' + hadErr);
                reject(hadErr)
            })
    })

}

function startGameServer() {

    const app = express();
    app.use(express.json());

    const gameServer = new Server({
        server: createServer(app),
    });

    gameServer.define('battle', BattleRoom)

    return gameServer.listen(port)
}

function handleCoreData(data:any) {
    console.log(`data`, data.toString());
}

startListeningSocket()
    .catch((err) => {
        console.log(`err`, err)
        console.log('Listening Server error');
    })

startSendingSocket()

startGameServer()
    .then(() => {
        console.log(`Server started on port ${port}`);
    })

