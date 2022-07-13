interface GlobalsContainer {
    PLAYERS_NUM: number;
    viewerSocket: any;
}


export const Globals:GlobalsContainer = {
    // The number of players in the game
    PLAYERS_NUM: 2,
    // socket.io sending seockt for field
    viewerSocket: undefined
}