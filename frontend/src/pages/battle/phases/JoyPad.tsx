import {createStore} from "solid-js/store";
import {DEVELOPMENT_AT_END_ROUND, LEVELS, RESOURCES_AT_END_ROUND, SLIDER_TYPE} from "../../../shared/constants";
import {createEffect, createMemo, createSignal, For, onMount} from "solid-js";
import {BattleInfoCurrentPlayer} from "../../../models/user";
import JoyPadInput from "../../../shared/components/JoyPadInput";
import {valueBetweenMinAndMax} from "../../../shared/helpers";
import Splash from "../../../shared/icons/Splash";
import LevelUp from "../../../shared/components/LevelUp";
import InstructionButton from "../../../shared/components/InstructionButton";

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

    (document.querySelector('#' + SLIDER_TYPE.MILITARY.toLowerCase()) as HTMLInputElement).value = "34";
    (document.querySelector('#' + SLIDER_TYPE.PRODUCTION.toLowerCase()) as HTMLInputElement).value = "33";
    (document.querySelector('#' + SLIDER_TYPE.RESEARCH.toLowerCase()) as HTMLInputElement).value = "33";
  });

  createEffect((prev) => {
    // Avoid animation if someone refreshes the page
    if (playerStats.milestones_reached > 0 && prev !== playerStats.milestones_reached) {
      levelUp();
    }
  }, playerStats.milestones_reached)

  const levelUp = () => {
    setShowLevelUp(true);

    setTimeout(() => {
      setShowLevelUp(false)
    }, 700);
  }

  const handleSliderInput = (value: number, type: SLIDER_TYPE) => {

    if (value < MIN || value > MAX) return;

    const sum = getTotal();
    const maxTotal = 100;
    const blocked = 0;

    setJoyPadStore(type.toLowerCase() as SLIDER_TYPE, (oldValue) => {
      let updateValue = value;
      const difference = value - oldValue.value;
      const MAX_STEP_DIFF = 7;

      // Doesn't allow big input range step difference from prev and next value!
      if (Math.abs(difference) > MAX_STEP_DIFF) {
        updateValue = difference > 0 ? oldValue.value + MAX_STEP_DIFF : oldValue.value - MAX_STEP_DIFF;
      }

      (document.querySelector('#' + type.toLowerCase()) as HTMLInputElement).value = Math.round(updateValue).toString();

      return { value: Math.round(updateValue) };
    });

    if (sum > maxTotal || sum < maxTotal) {
      for (let sliderType in SLIDER_TYPE) {
        if (type !== sliderType && !joyPadStore[sliderType.toLowerCase() as SLIDER_TYPE].disabled) {
          setJoyPadStore(sliderType.toLowerCase() as SLIDER_TYPE,(oldValue) => {
            const newValue = Math.round(valueBetweenMinAndMax(oldValue.value - ((sum - maxTotal) / (2 - blocked)), MIN, MAX));

            (document.querySelector('#' + sliderType.toLowerCase()) as HTMLInputElement).value = newValue.toString();

            return { value: newValue };
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
    <div class={"flex flex-col flex-1"}>
      <div class={"flex"}>
        <div class={"flex-1 flex flex-col items-center text-white"}>
          <span class={"text-xl text-grey mb-1"}>Colore</span>
          <Splash color={playerStats.color}/>
        </div>
        <div class={"flex-1 flex flex-col items-center text-white"}>
          <span class={"text-xl text-grey mb-1"}>Bombolette</span>
          <span class={"text-3xl"}>{playerStats.resources}</span>
        </div>
        <div class={"flex-1 flex flex-col items-center text-white"}>
          <span class={"text-xl text-grey mb-1"}>Mattoni</span>
          <span class={"text-3xl"}>{playerStats.score}</span>
        </div>
      </div>
      <div class={"flex justify-between"}>
        <p class={"mt-3 mb-2 text-white text-xl"}>
          Livello {playerStats.milestones_reached + 1}/{LEVELS.length - 1}: {LEVELS[playerStats.milestones_reached + 1]}
        </p>
        <p>
          <InstructionButton/>
        </p>
      </div>

      <div class={"flex gap-1"}>
        <div class={"flex-1"}>
          <div class={"h-2 bg-grey rounded-full"}>
            {playerStats.milestones_reached + 1 < 10 && <div class={"h-2 bg-white rounded-full transition-all ease-linear duration-500"} style={`width: ${playerStats.development}%`}/>}
          </div>
        </div>


        {/*<For each={[...Array(10).keys()]}>*/}
        {/*  {(item, index) =>*/}
        {/*    <div class={"flex-1"}>*/}
        {/*      <Splash color={index() < playerStats.milestones_reached + 1 ? "#F2C94C" : "#FFFFFF"}/>*/}
        {/*    </div>*/}
        {/*  }*/}
        {/*</For>*/}
      </div>

      <div class={"blue-rounded-container m-auto pb-5"}>

        {/*<div class={"flex justify-between items-center px-5 mb-3"}>*/}
        {/*  <span class={"text-white"}>Controlli</span>*/}
        {/*  <InstructionButton/>*/}
        {/*</div>*/}

        <div class={"flex justify-between items-end px-1"}>

          <JoyPadInput
            value={joyPadStore.military.value}
            type={SLIDER_TYPE.MILITARY}
            max={100}
            min={0}
            label={"Potenza spruzzo"}
            isDisabled={isInputDisabled(SLIDER_TYPE.MILITARY)}
            onChange={handleSliderChange}
            onInput={handleSliderInput}
            onLock={triggerLock}
            labelFormula={(value) => (`${Math.ceil(value)}<br>&nbsp;`)}
          />

          <JoyPadInput
            value={joyPadStore.production.value}
            type={SLIDER_TYPE.PRODUCTION}
            max={100}
            min={0}
            label={"Capacità di raccolta"}
            isDisabled={isInputDisabled(SLIDER_TYPE.PRODUCTION)}
            onChange={handleSliderChange}
            onInput={handleSliderInput}
            onLock={triggerLock}
            labelFormula={(value) => (`${((value / 100) * RESOURCES_AT_END_ROUND).toFixed(1)}<br>/turn`)}
          />

          <JoyPadInput
            value={joyPadStore.research.value}
            type={SLIDER_TYPE.RESEARCH}
            max={100}
            min={0}
            label={"Velocità di apprendimento"}
            isDisabled={isInputDisabled(SLIDER_TYPE.RESEARCH)}
            onChange={handleSliderChange}
            onInput={handleSliderInput}
            onLock={triggerLock}
            labelFormula={(value) => (`${((value / 100) * DEVELOPMENT_AT_END_ROUND).toFixed(1)}<br>/turn`)}
          />
        </div>
      </div>

      <LevelUp show={showLevelUp()}/>
    </div>
  )
}

export default JoyPad;
