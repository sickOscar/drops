import {useAuthState} from "../../../shared/context/auth.context";
import {useGameState} from "../../../shared/context/game.context";
import {createMemo, Show} from "solid-js";
import InstructionButton from "../../../shared/components/InstructionButton";
import {formatNextMatchInSeconds} from "../../../shared/helpers";
import {MAX_PLAYERS, MIN_PLAYERS} from "../../../shared/constants";

interface QueueProps {
  players?: string[]
}

interface PlayerDetail {
  name: string
  connected: boolean
  avatar: string
}

const PlayerRow = (props: { player: PlayerDetail, highlight: boolean }) => {
  const { player, highlight } = props;

  return (
    <li
      class={`${!player.connected ? "disconnected" : undefined} flex my-5 items-center ${highlight ? "bg-semitransparent-acquamarine" : "bg-semitransparent-grey"} rounded-[45px] p-1`}>
      <img src={player.avatar} alt=""
           class={"w-[50px] h-[50px] mr-5 rounded-full border-2 border-black"}/>
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
      <p class={"text-white text-xl"}>Prossimi giocatori</p>
      <div class={"mb-24 overflow-y-auto"}>
        {
          playersLobbies()?.map((lobby, index) => {
            if (index === 0) {
              return (
                <ul>
                  {
                    lobby.map(player => <PlayerRow player={player} highlight={player.name === auth?.user?.name} />)
                  }
                </ul>
              )
            }

            return (
              <ul>
                <p class={"text-white text-xl"}>Giocatori in coda, match #{index + 1}</p>
                {
                  lobby.map(player => <PlayerRow player={player} highlight={player.name === auth?.user?.name} />)
                }
              </ul>
            )
          })
        }
      </div>

      <div class={"text-white text-sm blue-rounded-container border-1 fixed bottom-0 left-0 right-0 px-5 py-8 flex items-center justify-between"}>
        <Show when={gameState && gameState?.relayTimer > 0}>
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

        <InstructionButton/>
      </div>
    </>
  )
}

export default Queue;
