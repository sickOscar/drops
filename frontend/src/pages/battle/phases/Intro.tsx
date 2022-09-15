import {Component} from "solid-js";

interface IntroProps {
  onJoin: () => void
}

const Intro: Component<IntroProps> = (props) => {
  const { onJoin } = props;

  return (
    <div class={"text-white"}>
      <p>
        Pronto a dipingere? Clicca sul pulsante per entrare nella lobby di attesa!
      </p>
      <button class={"h-[3em] mt-10 w-full acquamarine-button"} onClick={onJoin}>
        Join!
      </button>
    </div>
  )
}

export default Intro;
