import {createStore} from "solid-js/store";
import {DEVELOPMENT_AT_END_ROUND, LEVELS, RESOURCES_AT_END_ROUND, SLIDER_TYPE} from "../../../shared/constants";
import {createEffect, createMemo, createSignal, For, onMount} from "solid-js";
import {BattleInfoCurrentPlayer} from "../../../models/user";
import JoyPadInput from "../../../shared/components/JoyPadInput";
import {valueBetweenMinAndMax} from "../../../shared/helpers";
import Splash from "../../../shared/icons/Splash";
import LevelUp from "../../../shared/components/LevelUp";

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
  const [showLevelUp, setShowLevelUp] = createSignal<boolean>(false);
  const MIN = 0;
  const MAX = 100;

  onMount(() => {
    setJoyPadStore("military", "value", 34);
    setJoyPadStore("production", "value", 33);
    setJoyPadStore("research", "value", 33);
  });

  createEffect(() => {
    if (playerStats.milestones_reached > 0) {
      setShowLevelUp(true);

      setTimeout(() => {
        setShowLevelUp(false)
      }, 700);
    }
  })

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
            return { value: valueBetweenMinAndMax(oldValue.value - ((sum - maxTotal) / (2 - blocked)), MIN, MAX) };
          });
        }
      }
    }
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
      <div class={"flex"}>
        <div class={"flex-1 flex flex-col items-center text-white"}>
          <span class={"text-xl text-grey"}>Colore</span>
          <Splash color={playerStats.color}/>
        </div>
        <div class={"flex-1 flex flex-col items-center text-white"}>
          <span class={"text-xl text-grey"}>Bombolette</span>
          <span class={"text-3xl"}>{playerStats.resources}</span>
        </div>
        <div class={"flex-1 flex flex-col items-center text-white"}>
          <span class={"text-xl text-grey"}>Mattoni</span>
          <span class={"text-3xl"}>{playerStats.score}</span>
        </div>
      </div>
      <p class={"mt-5 mb-2 text-white text-xl"}>
        Livello {playerStats.milestones_reached + 1}: {LEVELS[playerStats.milestones_reached + 1]}
      </p>
      <div class={"flex gap-2"}>
        <For each={[...Array(10).keys()]}>
          {(item, index) =>
            <div class={"flex-1"}>
              <Splash color={index() < playerStats.milestones_reached + 1 ? "#F2C94C" : "#FFFFFF"}/>
            </div>
          }
        </For>
      </div>

      <input class={"my-5"} type="range" min={0} max={100} value={playerStats.milestones_reached === 9 ? 100 : playerStats.development} disabled/>

      <div class={"flex gap-2 items-end"}>
        <JoyPadInput
          value={joyPadStore.research.value}
          type={SLIDER_TYPE.RESEARCH}
          max={100}
          min={0}
          label={"Impara l'arte!"}
          isDisabled={isInputDisabled(SLIDER_TYPE.RESEARCH)}
          onChange={handleSliderChange}
          onInput={handleSliderInput}
          onLock={triggerLock}
          labelFormula={(value) => (`${((value / 100) * DEVELOPMENT_AT_END_ROUND).toFixed(1)}<br>/turn`)}
        />

        <JoyPadInput
          value={joyPadStore.production.value}
          type={SLIDER_TYPE.PRODUCTION}
          max={100}
          min={0}
          label={"Raccogli bombolette"}
          isDisabled={isInputDisabled(SLIDER_TYPE.PRODUCTION)}
          onChange={handleSliderChange}
          onInput={handleSliderInput}
          onLock={triggerLock}
          labelFormula={(value) => (`${((value / 100) * RESOURCES_AT_END_ROUND).toFixed(1)}<br>/turn`)}
        />

        <JoyPadInput
          value={joyPadStore.military.value}
          type={SLIDER_TYPE.MILITARY}
          max={100}
          min={0}
          label={"Spruzza!"}
          isDisabled={isInputDisabled(SLIDER_TYPE.MILITARY)}
          onChange={handleSliderChange}
          onInput={handleSliderInput}
          onLock={triggerLock}
          labelFormula={(value) => (`${Math.ceil(value)}<br>&nbsp;`)}
        />
      </div>

      <LevelUp show={showLevelUp()}/>
    </>
  )
}

export default JoyPad;
