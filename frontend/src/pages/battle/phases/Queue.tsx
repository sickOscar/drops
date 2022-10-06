import {useAuthState} from "../../../shared/context/auth.context";
import {useGameState} from "../../../shared/context/game.context";
import {createMemo, createSignal, Show} from "solid-js";
import InstructionButton from "../../../shared/components/InstructionButton";
import {formatNextMatchInSeconds} from "../../../shared/helpers";
import {MAX_PLAYERS, MIN_PLAYERS} from "../../../shared/constants";
import {PlayerDetail} from "../../../models/user";
import PlayerImageRounded from "../../../shared/components/PlayerImageRounded";

interface QueueProps {
  players?: string[]
}

const PlayerRow = (props: { player: PlayerDetail, highlight: boolean }) => {
  const { player, highlight } = props;

  return (
    <li
      class={`${!player.connected ? "disconnected" : undefined} animate__animated animate__fadeInDown flex my-5 items-center ${highlight ? "bg-semitransparent-acquamarine" : "bg-semitransparent-grey"} rounded-[45px] p-1`}>
      <PlayerImageRounded player={player}/>
      <span class={"text-white"}>{player.name}</span>
    </li>
  )
}

const Queue = (props: QueueProps) => {
  const auth = useAuthState();
  const gameState = useGameState();

  const detail = (player: string): PlayerDetail => {
    const name = player.split('|')[0];
    const connected = player.split('|')[1] === "true";
    const avatar = player.split('|')[2];

    return {
      name,
      connected,
      avatar
    }
  }

  const playersLobbies = createMemo<Array<Array<PlayerDetail>> | undefined>(() => {
    const result = (props.players || [])?.reduce((result: any[], item, index) => {
      const chunkIndex = Math.floor(index / MAX_PLAYERS);

      if (!result[chunkIndex]) {
        result[chunkIndex] = [];
      }

      result[chunkIndex].push(detail(item));

      return result;
    }, []);

    return result;
  });

  return (
    <>
      <div class={"mb-24 overflow-y-auto"}>
        {
          playersLobbies()?.map((lobby, index) => {
            if (index === 0) {
              return (
                <ul>
                  {
                    lobby.map(player => <PlayerRow player={player} highlight={player.name === auth?.user?.nickname}/>)
                  }
                </ul>
              )
            }

            return (
              <ul>
                <p class={"text-white text-xl"}>Giocatori in coda, match #{index + 1}</p>
                {
                  lobby.map(player => <PlayerRow player={player} highlight={player.name === auth?.user?.nickname}/>)
                }
              </ul>
            )
          })
        }
      </div>

      <div class={"text-white text-sm blue-rounded-container border-1 fixed bottom-0 left-0 right-0 px-5 py-8 flex items-center justify-between"}>

        <div>
          <Show when={gameState && gameState?.relayRoom && gameState?.relayTimer === -1}>
            <p class={"text-white text-xl"}>In attesa...</p>
          </Show>

          <Show when={gameState && gameState?.relayTimer >= 0}>
            <div>
              <p class={"text-grey"}>Prossima partita tra:</p>
              <p class={"text-xl"}>{formatNextMatchInSeconds(gameState!.relayTimer)}</p>
            </div>
          </Show>

          <Show when={props.players && props.players?.length < MIN_PLAYERS}>
            <div>
              <p class={"text-grey"}>In attesa di giocatori...</p>
              <p class={"text-xl"}>{props.players?.length} / {MIN_PLAYERS}</p>
            </div>
          </Show>
        </div>

        <InstructionButton/>
      </div>
    </>
  )
}

export default Queue;
