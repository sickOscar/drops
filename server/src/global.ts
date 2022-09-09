interface GlobalsContainer {
  GAME_WAITING_TIME: number;
  MIN_PLAYERS_NUMBER: number;
  viewerSocket: any;
}


export const Globals: GlobalsContainer = {
  GAME_WAITING_TIME: 10000,
  // The number of players in the game
  MIN_PLAYERS_NUMBER: 2,
  // socket.io sending seockt for field
  viewerSocket: undefined
}