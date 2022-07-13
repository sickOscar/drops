import {RoomListingData} from "colyseus";

export function enhanced_logging(relay: RoomListingData<any>, battle: RoomListingData<any>) {
    let ui = {
        relay: {
            clients: relay.clients
        },
        battle: {
            clients: battle.clients
        }
    }

    setInterval(() => {

        const newUi = {
            relay: {
                clients: relay.clients
            },
            battle: {
                clients: battle.clients,
            }
        }

        if (JSON.stringify(newUi) !== JSON.stringify(ui)) {

            ui = newUi;

            console.log('----------------------------------------------------');
            console.table(newUi);
            console.log('----------------------------------------------------');
        }


    }, 1000)
}