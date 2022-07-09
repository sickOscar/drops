import {RoomListingData} from "colyseus";

export function enhanced_logging(relay: RoomListingData<any>, battle: RoomListingData<any>) {
    let ui = {
        relay: {
            connected: relay.clients
        },
        battle: {
            connected: battle.clients
        }
    }

    setInterval(() => {

        const newUi = {
            relay: {
                connected: relay.clients
            },
            battle: {
                connected: battle.clients
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