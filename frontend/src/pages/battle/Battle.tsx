import JoyPad from "./phases/JoyPad";
import Intro from "./phases/Intro";
import {useAuthState} from "../../shared/context/auth.context";
import {User} from "@auth0/auth0-spa-js";
import {useGameDispatch, useGameState} from "../../shared/context/game.context";
import Queue from "./phases/Queue";
import Ended from "./phases/Ended";
import {BattleInfoCurrentPlayer} from "../../models/user";

const Battle = () => {
  const useAuth = useAuthState();
  const gameDispatch = useGameDispatch();
  const gameState = useGameState();

  const isInIntro = () => gameState?.ui === "intro";
  const isInQueue = () => gameState?.ui === "queue";
  const isInGame = () => gameState?.ui === "playing";
  const isGameEnded = () => gameState?.ui === "ended";
  const isLoadingRelayRoom = () => gameState?.loading.relayRoom;
  const isLoadingBattleRoom = () => gameState?.loading.battleRoom;

  const handleUserJoin = () => {
    gameDispatch?.startGameLoop(useAuth?.user as User);
  }

  const handleSliderChange = (values: {military: number, research: number, production: number}) => {
    gameDispatch?.sendSliderValues(values);
  }

  const handlePlayAgain = () => {
    gameDispatch?.playAgain();
  }

  return (
    <>
      {
        isInIntro() && (
          <Intro
            user={useAuth?.user as User}
            onJoin={handleUserJoin}
          />
        )
      }
      {
        isInQueue() && (
          <>
            {isLoadingRelayRoom() && <span>Joining room...</span>}
            {!isLoadingRelayRoom() && gameState?.errors.relayRoom && <span>Error joining relay room, please try again refreshing the page</span>}
            {!isLoadingRelayRoom() && !gameState?.errors.relayRoom && (gameState?.relayQueue.length || 0) > 0 && <Queue players={gameState?.relayQueue}/>}
          </>
        )
      }
      {
        isInGame() && (
          <>
            {isLoadingBattleRoom() && <span>Joining battle...</span>}
            {!isLoadingBattleRoom() && gameState?.errors.battleRoom && <span>Error joining battle room, please try again refreshing the page</span>}
            {!isLoadingBattleRoom() && !gameState?.errors.battleRoom && gameState?.currentPlayerStats !== null && <JoyPad onChange={handleSliderChange} playerStats={gameState?.currentPlayerStats as BattleInfoCurrentPlayer}/>}
          </>
        )
      }
      {
        isGameEnded() && (
          <Ended onPlayAgain={handlePlayAgain}/>
        )
      }
    </>
  )
}

export default Battle;
