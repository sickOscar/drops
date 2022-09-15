import {GameStateContext} from "./context/game.context";

export const valueBetweenMinAndMax = (value: number, MIN: number, MAX: number) => {
  if (value > MAX) {
    return MAX
  }

  if (value < MIN) {
    return MIN;
  }

  return value;
}

export const formatNextMatchInSeconds = (milliseconds: number): string => {
  return (
    `${new Date(milliseconds).toISOString().slice(14, 19)}`
  )
}

export const isInIntro = (gameState: GameStateContext | undefined) => gameState?.ui === "intro";
export const isInQueue = (gameState: GameStateContext | undefined) => gameState?.ui === "queue";
export const isInGame = (gameState: GameStateContext | undefined) => gameState?.ui === "playing";
export const isGameEnded = (gameState: GameStateContext | undefined) => gameState?.ui === "ended";
export const isLoadingRelayRoom = (gameState: GameStateContext | undefined) => gameState?.loading.relayRoom;
export const isLoadingBattleRoom = (gameState: GameStateContext | undefined) => gameState?.loading.battleRoom;
