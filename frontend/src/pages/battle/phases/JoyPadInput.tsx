import {SLIDER_TYPE} from "../../../shared/constants";

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
  const lockIcon = () => props.isDisabled ? "fa fa-lock" : "fa fa-lock-open";

  return (
    <div class="range-container">
      <label for={props.type}>Military</label>
      <div class={"flex"}>
        <button class={"w-[20px]"} onClick={(e: any) => props.onLock(props.type)}>
          <em class={lockIcon()}></em>
        </button>
        <input onInput={(e: any) => props.onInput(parseInt(e.target.value, 10), props.type)}
               onChange={props.onChange}
               type="range"
               min={0}
               max={100}
               id={props.type}
               value={props.value}
               step={1}
               class={"basis-10/12"}
               disabled={props.isDisabled}
        />
        <span class={"mx-auto"}>{props.labelFormula(props.value)}</span>
      </div>
    </div>
  )
}

export default JoyPadInput;
