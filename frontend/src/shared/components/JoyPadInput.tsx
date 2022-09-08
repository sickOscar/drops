import {SLIDER_TYPE} from "../constants";
import LockOpen from "../icons/LockOpen";
import LockClosed from "../icons/LockClosed";

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
  const lockIcon = () => props.isDisabled ? <LockClosed/> : <LockOpen/>;

  return (
    <div class={"joyPadInput flex flex-col flex-1 items-center text-center relative"}>
      <label class="text-grey break-words" for={props.type}>{props.label}</label>
      <div class={"joyPadInput__range-container flex flex-col border-1 rounded-[45px] bg-semitransparent-grey mx-auto w-[6rem] h-[35vh] p-4 mt-3 relative justify-between items-center main-shadow"}>
        <span class={"text-white top-4"} innerHTML={props.labelFormula(props.value)}></span>
        <input onInput={(e: any) => props.onInput(parseInt(e.target.value, 10), props.type)}
           onChange={props.onChange}
           type="range"
           min={0}
           max={100}
           id={props.type}
           value={props.value}
           step={1}
           disabled={props.isDisabled}
           class={"max-w-[16vh] sm:max-w-max mb-[-1.5em]"}
        />
        <button class={"h-[80px] w-[80px] flex items-center justify-center mb-[-1em]"} onClick={(e: any) => props.onLock(props.type)}>
          {lockIcon()}
        </button>
      </div>
    </div>
  )
}

export default JoyPadInput;
