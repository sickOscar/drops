import {useAuthState} from "../../../shared/context/auth.context";

interface QueueProps {
  players?: string[]
}

const Queue = (props: QueueProps) => {
  const auth = useAuthState();

  const detail = (player: string) => {
    const name = player.split('|')[0];
    const connected = player.split('|')[1] === "true";
    const avatar = player.split('|')[2];

    return {
      name,
      connected,
      avatar
    }
  }

  return (
    <>
      <h1 class={"text-white text-xl"}>Giocatori in coda</h1>
      <ul>
        {
          props.players?.map(detail).map(player => (
            <li class={`${!player.connected ? "disconnected" : undefined} flex my-5 items-center ${player.name === auth?.user?.name ? "bg-semitransparent-acquamarine" : "bg-semitransparent-grey"} rounded-[45px] p-1`}>
              <img src={player.avatar} alt="" class={"w-[50px] h-[50px] mr-5 rounded-full border-2 border-black"}/>
              <span class={"text-white"}>{player.name}</span>
            </li>
          ))
        }
      </ul>
    </>
  )
}

export default Queue;
