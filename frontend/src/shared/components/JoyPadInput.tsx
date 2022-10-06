import {SLIDER_TYPE} from "../constants";
import LockOpen from "../icons/LockOpen";
import LockClosed from "../icons/LockClosed";
import {createEffect, createSignal} from "solid-js";

interface JoyPadInputProps {
  label: string
  type: SLIDER_TYPE
  isDisabled: boolean
  min: number
  max: number
  value: number
  onInput: (value: number, type: SLIDER_TYPE) => void
  onChange: () => void
  onLock: (type: SLIDER_TYPE) => void
  labelFormula: (value: number) => string
}

const JoyPadInput = (props: JoyPadInputProps) => {
  const [ labelHeight, setLabelHeight ] = createSignal<number>(0);

  const lockIcon = () => props.isDisabled ? <LockClosed/> : <LockOpen/>;

  const handleInput = (e: any) => {
    props.onInput(parseInt(e.target.value, 10), props.type);
  }

  const handleInputChange = (e: any) => {
    e.preventDefault();
    props.onChange();
  }

  createEffect(() => {
    setLabelHeight(props.value);
  })

  const labelStyle = (): object => {
    return { "top": `${100 - Math.floor(labelHeight())}px` };
  }

  const backgroundInputStyle = (): object => {
    return { "background-size": `${Math.floor(labelHeight())}% 100%` };
  }

  return (
    <div class={"joyPadInput flex flex-col flex-1 items-center text-center relative"}>
      <label class="text-grey break-words" for={props.type}>{props.label}</label>
      <div class={"joyPadInput__range-container flex flex-col border-1 rounded-[45px] bg-semitransparent-grey mx-auto w-[5.5rem] h-[45vh] p-4 mt-3 relative justify-between items-center main-shadow"}>
        <span class={`text-white z-30`} innerHTML={props.labelFormula(props.value)}></span>
        <input
           onInput={handleInput}
           onChange={handleInputChange}
           type="range"
           min={0}
           max={100}
           id={props.type.toLowerCase()}
           // value={props.value.toString()}
           step={1}
           disabled={props.isDisabled}
           class={`my-auto ${props.isDisabled ? 'locked' : null} w-[30vh]`}
           style={backgroundInputStyle()}
        />
        <button class={"h-[50px] w-[50px] flex items-center justify-center mb-[-0.5em]"} onClick={(e: any) => props.onLock(props.type)}>
          {lockIcon()}
        </button>
      </div>
    </div>
  )
}

export default JoyPadInput;
