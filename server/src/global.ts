interface GlobalsContainer {
  GAME_WAITING_TIME: number;
  GAME_EXIT_TIME: number;
  GAME_MAX_ROUNDS: number;
  MIN_PLAYERS_NUMBER: number;
  MAX_PLAYERS_NUMBER: number;
  viewerSocket: any;
  playersForThisGame: number;
}

export const Globals: GlobalsContainer = {
  GAME_WAITING_TIME: 15000,
  GAME_EXIT_TIME: 15000,
  GAME_MAX_ROUNDS: 300,
  // The number of players in the game
  MIN_PLAYERS_NUMBER: 2,
  MAX_PLAYERS_NUMBER: 8,
  // socket.io sending seockt for field
  viewerSocket: undefined,
  playersForThisGame: 0
}