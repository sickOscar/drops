import JoyPad from "./phases/JoyPad";
import {useAuthState} from "../../shared/context/auth.context";
import {User} from "@auth0/auth0-spa-js";
import {useGameDispatch, useGameState} from "../../shared/context/game.context";
import Queue from "./phases/Queue";
import Ended from "./phases/Ended";
import {BattleInfoCurrentPlayer} from "../../models/user";
import ErrorMessage from "../../shared/components/ErrorMessage";
import {
  isGameEnded,
  isInGame,
  isInIntro,
  isInQueue,
  isLoadingBattleRoom,
  isLoadingRelayRoom
} from "../../shared/helpers";
import Intro from "./phases/Intro";

const Battle = () => {
  const useAuth = useAuthState();
  const gameDispatch = useGameDispatch();
  const gameState = useGameState();

  const joinLobby = () => {
    gameDispatch?.startGameLoop(useAuth?.user as User);
  }

  const handleSliderChange = (values: {military: number, research: number, production: number}) => {
    gameDispatch?.sendSliderValues(values);
  }

  return (
    <>
      {
        isInIntro(gameState) && (
          <Intro
            onJoin={joinLobby}
          />
        )
      }
      {
        isInQueue(gameState) && (
          <>
            {isLoadingRelayRoom(gameState) && <span class={"text-white text-xl"}>Joining room...</span>}
            {!isLoadingRelayRoom(gameState) && gameState?.errors.relayRoom && <ErrorMessage message={"Error joining relay room, please try again refreshing the page."}/>}
            {!isLoadingRelayRoom(gameState) && !gameState?.errors.relayRoom && (gameState?.relayQueue.length || 0) > 0 && <Queue players={gameState?.relayQueue}/>}
          </>
        )
      }
      {
        isInGame(gameState) && (
          <>
            {isLoadingBattleRoom(gameState) && <span class={"text-white text-xl"}>Joining battle...</span>}
            {!isLoadingBattleRoom(gameState) && gameState?.errors.battleRoom && <ErrorMessage message={"Error joining battle room, please try again refreshing the page."}/>}
            {!isLoadingBattleRoom(gameState) && !gameState?.errors.battleRoom && gameState?.currentPlayerStats !== null && <JoyPad onChange={handleSliderChange} playerStats={gameState?.currentPlayerStats as BattleInfoCurrentPlayer}/>}
          </>
        )
      }
      {
        isGameEnded(gameState) && (
          <Ended onPlayAgain={joinLobby}/>
        )
      }
    </>
  )
}

export default Battle;
