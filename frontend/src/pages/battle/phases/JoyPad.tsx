import {createStore} from "solid-js/store";
import {DEVELOPMENT_AT_END_ROUND, RESOURCES_AT_END_ROUND, SLIDER_TYPE} from "../../../shared/constants";
import {createMemo, onMount} from "solid-js";
import {BattleInfoCurrentPlayer} from "../../../models/user";
import JoyPadInput from "./JoyPadInput";

interface SliderState {
  military: ResourceType
  production: ResourceType
  research: ResourceType
}

interface ResourceType {
  value: number
  disabled: boolean
}

const initialState: SliderState = {
  military: {
    value: 34,
    disabled: false
  },
  production: {
    value: 33,
    disabled: false
  },
  research: {
    value: 33,
    disabled: false
  },
}

interface JoyPadProps {
  onChange: ({military, research, production}: {military: number, research: number, production: number}) => void,
  playerStats: BattleInfoCurrentPlayer
}

const JoyPad = ({onChange, playerStats}: JoyPadProps) => {
  const [joyPadStore, setJoyPadStore] = createStore<SliderState>(initialState);
  const MIN = 0;
  const MAX = 100;

  onMount(() => {
    setJoyPadStore("military", "value", 34);
    setJoyPadStore("production", "value", 33);
    setJoyPadStore("research", "value", 33);
  });

  const handleSliderInput = (value: number, type: SLIDER_TYPE) => {

    if (value < MIN || value > MAX) return;

    const sum = getTotal();
    const maxTotal = 100;
    const blocked = 0;

    setJoyPadStore(type.toLowerCase() as SLIDER_TYPE, {value});

    if (sum > maxTotal || sum < maxTotal) {
      for (let sliderType in SLIDER_TYPE) {
        if (type !== sliderType && !joyPadStore[sliderType.toLowerCase() as SLIDER_TYPE].disabled) {
          setJoyPadStore(sliderType.toLowerCase() as SLIDER_TYPE,(oldValue) => {
            return { value: valueBetweenMinAndMax(oldValue.value - ((sum - maxTotal) / (2 - blocked))) };
          });
        }
      }
    }
  }

  const valueBetweenMinAndMax = (value: number) => {
    if (value > MAX) {
      return MAX
    }

    if (value < MIN) {
      return MIN;
    }

    return value;
  }

  const getTotal = createMemo(() => {
    return joyPadStore.research.value + joyPadStore.production.value + joyPadStore.military.value;
  })

  const handleSliderChange = () => {
    onChange({
      military: joyPadStore.military.value / 100,
      production: joyPadStore.production.value / 100,
      research: joyPadStore.research.value / 100
    });
  }

  const lockIcon = (type: SLIDER_TYPE) => {
    return joyPadStore[type.toLowerCase() as SLIDER_TYPE].disabled ? "fa fa-lock" : "fa fa-lock-open";
  }

  const triggerLock = (type: SLIDER_TYPE) => {
    setJoyPadStore(type.toLowerCase() as SLIDER_TYPE, (oldValue) => {
      return { disabled: !oldValue.disabled };
    });
  }

  const isInputDisabled = (type: SLIDER_TYPE) => {
    return joyPadStore[type.toLowerCase() as SLIDER_TYPE].disabled;
  }

  return (
    <>
      <div class={"w-100 h-[100px]"} style={{"background-color": playerStats.color}}></div>
      <p>
        resources: {playerStats.resources}
      </p>
      <p>
        cells: {playerStats.score}
      </p>
      <p>
        level: {playerStats.milestones_reached}
      </p>
      <input type="range" min={0} max={100} value={playerStats.milestones_reached === 9 ? 100 : playerStats.development} disabled/>
      <div class={"flex flex-col"}>
        <JoyPadInput
          value={joyPadStore.military.value}
          type={SLIDER_TYPE.MILITARY}
          max={100}
          min={0}
          label={"Military"}
          isDisabled={isInputDisabled(SLIDER_TYPE.MILITARY)}
          onChange={handleSliderChange}
          onInput={handleSliderInput}
          onLock={triggerLock}
          labelFormula={(value) => (`${Math.ceil(value)}`)}
        />

        <JoyPadInput
          value={joyPadStore.production.value}
          type={SLIDER_TYPE.PRODUCTION}
          max={100}
          min={0}
          label={"Production"}
          isDisabled={isInputDisabled(SLIDER_TYPE.PRODUCTION)}
          onChange={handleSliderChange}
          onInput={handleSliderInput}
          onLock={triggerLock}
          labelFormula={(value) => (`${((value / 100) * RESOURCES_AT_END_ROUND).toFixed(1)}/turn`)}
        />

        <JoyPadInput
          value={joyPadStore.research.value}
          type={SLIDER_TYPE.RESEARCH}
          max={100}
          min={0}
          label={"Research"}
          isDisabled={isInputDisabled(SLIDER_TYPE.RESEARCH)}
          onChange={handleSliderChange}
          onInput={handleSliderInput}
          onLock={triggerLock}
          labelFormula={(value) => (`${((value / 100) * DEVELOPMENT_AT_END_ROUND).toFixed(1)}/turn`)}
        />
      </div>
    </>
  )
}

export default JoyPad;
