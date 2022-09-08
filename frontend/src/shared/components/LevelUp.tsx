import {Component} from "solid-js";
import img from "../../assets/level-up.png";

interface Props {
  show: boolean
}

// TODO: fare la grafica e non buttare l'immagine dentro a caso
const LevelUp: Component<Props> = (props) => {
  return (
    <div class={`flex justify-center items-center fixed inset-0 w-screen h-screen z-50 transition-all ${props.show ? 'opacity-100 visible' : 'opacity-0 invisible'} `}>
      <img class={"w-full h-full object-cover"} src={img} alt=""/>
    </div>
  )
}

export default LevelUp;
