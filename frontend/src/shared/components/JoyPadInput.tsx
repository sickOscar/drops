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
      <label class="text-grey text-xl" for={props.type}>{props.label}</label>
      <div class={"joyPadInput__range-container flex flex-col border-1 rounded-[45px] bg-semitransparent-grey mx-auto w-[6rem] h-[40vh] p-5 mt-3 relative justify-between"}>
        <span class={"text-white mx-auto"} innerHTML={props.labelFormula(props.value)}></span>
        <div class={"flex-1 flex justify-center items-center"}>
          <input onInput={(e: any) => props.onInput(parseInt(e.target.value, 10), props.type)}
             onChange={props.onChange}
             type="range"
             min={0}
             max={100}
             id={props.type}
             value={props.value}
             step={1}
             disabled={props.isDisabled}
          />
        </div>
        <button class={"h-[80px] flex items-center justify-center"} onClick={(e: any) => props.onLock(props.type)}>
          {lockIcon()}
        </button>
      </div>
    </div>
  )
}

export default JoyPadInput;
