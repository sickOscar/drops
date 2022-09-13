import {createSignal, onCleanup, onMount, Show} from "solid-js";

interface Props {
  children: any
}

const ScreenOrientationGuard = (props: Props) => {
  const [ orientation, setOrientation ] = createSignal<"portrait" | "landscape">("portrait");

  const handleOrientation = () => {
    // Need to add a delay otherwise can catch some wrong value the matchmedia query
    setTimeout(() => {
      if (window.matchMedia("(orientation: portrait)").matches) {
        setOrientation("portrait");
      } else {
        setOrientation("landscape");
      }
    }, 50);
  }

  onMount(() => {
    handleOrientation();

    window.addEventListener("orientationchange", handleOrientation);
  })

  onCleanup(() => {
    window.removeEventListener("orientationchange", handleOrientation);
  })

  return (
    <>
      {
        props.children
      }
      <Show when={orientation() === "landscape"}>
        <div class={"absolute inset-0 z-50 bg-[url('/src/assets/bg.png')] bg-no-repeat bg-cover flex items-center justify-center text-white flex-col"}>
          <p class={"text-2xl"}>NOPE!</p>
          <span>
            Devi usare lo smartphone in verticale per poter giocare, grazie!
          </span>
        </div>
      </Show>
    </>
  )
}

export default ScreenOrientationGuard;
