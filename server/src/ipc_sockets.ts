import fs from "fs";
import net from "net";
import * as util from "util";
import * as dotenv from "dotenv";
dotenv.config();

const SOCKET_TO_NODE = process.env.SOCKET_TO_NODE;
const SOCKET_FROM_NODE = process.env.SOCKET_FROM_NODE;


async function startSendingSocket(): Promise<net.Socket> {

    // pomisify fs.stat via util
    const stat = util.promisify(fs.stat);

    try {
        await stat(SOCKET_FROM_NODE);

        try {
            // promisify unlink via util
            const unlink = util.promisify(fs.unlink);
            await unlink(SOCKET_FROM_NODE);

        } catch (err) {
            console.log(`Error deleting socket: ${err}`);
            process.exit(1);
        }

    } catch (err) {
        console.log(err);
        console.log('No leftover socket found.');
    }

    return new Promise(async (resolve, reject) => {


        const server = net.createServer(function (socket) {
            console.log('Connection acknowledged.');
        });

        server.listen(SOCKET_FROM_NODE, function () {
            console.log('Sending socket listening on ' + SOCKET_FROM_NODE);
        })
            .on("connection", function (socket) {
                console.log('CORE connected');
                // HERE DATA GOES TO RUST
                resolve(socket);
                // setInterval(() => {
                //     // console.log("Sending data...")
                //     const military = Math.random();
                //     const production = Math.random();
                //     const research = Math.random();
                //     socket.write(`|1|(${military},${production},${research})\n`);
                // }, 100)
            })
            .on("close", function () {
                console.log('Sending socket closed');
                setTimeout(() => {
                    resolve(startSendingSocket());
                }, 5000)
            })
            .on("error", function (err) {
                console.log('Sending socket error: ' + err);
                reject(err);
            })
    })


}

async function createCoreListeningSocket(): Promise<net.Socket> {

    try {
        return await new Promise((resolve, reject) => {
            const socket = net.createConnection(SOCKET_TO_NODE);

            socket.on('connect', () => {
                console.log('Connected to drops server');
                resolve(socket);
            })
            socket.on('disconnect', () => {
                console.log('Disconnected from drops server');
            })
            // socket.on("data", (data) => {
            //     console.log('Got data');
            // })
            socket.on('error', (err) => {
                console.log('Error: ' + err);
                reject(err);
            })
            socket.on('close', (hadErr) => {
                console.log('Closed: ' + hadErr);
            })
        })
    } catch (err) {
        // console.log("Failed to start listening socket, retry in 5 second...");
        await sleep(5000);
        return createCoreListeningSocket();
    }

}


export const coreListeningSocket = createCoreListeningSocket()
export const coreSendingSocket = startSendingSocket()


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
