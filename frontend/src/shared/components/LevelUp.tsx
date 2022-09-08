import {Component} from "solid-js";

interface Props {
  show: boolean
}

const LevelUp: Component<Props> = (props) => {
  return (
    <div class={`flex justify-center items-center fixed inset-0 bg-blue-300 w-screen h-screen z-10 transition-all ${props.show ? 'opacity-100 visible' : 'opacity-0 invisible'} `}>
      Level up!
    </div>
  )
}

export default LevelUp;
