interface QueueProps {
  players?: string[]
}

const Queue = ({players}: QueueProps) => {
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
      <h1>WAITING FOR OTHER PLAYERS...</h1>
      <h2>People waiting to play:</h2>
      <ol>
        {
          players?.map(detail).map(player => (
            <li class={`${!player.connected ? "disconnected" : undefined} flex my-5`}>
              <img src={player.avatar} alt="" class={"w-[50px] h-[50px] mr-5"}/>
              {player.name}
            </li>
          ))
        }
      </ol>
    </>
  )
}

export default Queue;
