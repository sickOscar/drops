import {createSignal, Show} from "solid-js";
import {PlayerDetail} from "../../models/user";

interface Props {
  player: PlayerDetail
}

const PlayerImageRounded = (props: Props) => {
  const { player } = props;
  const [ imgError, setImgError ] = createSignal(false);
  const commonClasses = "w-[50px] h-[50px] mr-5 rounded-full border-2 border-black";

  const letters = () => {
    const [firstName, lastName] = props.player.name.split(" ");
    return (<>{firstName[0] || ""}&nbsp;{lastName[0] || ""}</>);

    // return (<>{props.player.name[0] || ""}</>);
  }

  return (
    <>
      <Show when={!imgError()}>
        <img src={player.avatar} alt=""
             class={commonClasses}
             onError={() => setImgError(true)}
        />
      </Show>
      <Show when={imgError()}>
        <div class={`${commonClasses} bg-white flex justify-center items-center text-xl`}>
          {letters()}
        </div>
      </Show>
    </>
  )
}

export default PlayerImageRounded;
