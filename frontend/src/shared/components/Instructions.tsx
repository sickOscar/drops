import Close from "../icons/Close";
import {useUiDispatch} from "../context/ui.context";

const Instructions = () => {
  const uiDispatch = useUiDispatch();

  const close = () => {
    uiDispatch?.toggleInstruction();
  }

  return (
    <div class={"instructionModal fixed z-50 inset-0 px-5 py-10 flex flex-col text-white bg-[url('/src/assets/bg_scritte.png')] bg-no-repeat bg-cover"}>

      <div class={"flex justify-between mb-10 items-center"}>
        <p class={"text-2xl"}>Istruzioni di gioco</p>
        <button onClick={close}>
          <Close/>
        </button>
      </div>

      <div class={"overflow-y-auto"}>
        <p>Regola i controlli di gioco per conquistare più mattoni possibili e battere gli avversari!</p>

        <p>Ad ogni turno, le tue macchie di inchiostro proveranno ad espandersi: potrai controllarne la crescita con i controlli di gioco.</p>

        <p class={"text-grey mt-5"}>Potenza spruzzo:</p>
        <p>
          Aumenta la potenza del tuo spruzzo per coprire il muro e i colori degli altri giocatori!
          Ma attenzione: spruzzare ti costerà bombolette!
          Potrai coprire il colore del tuo avversario
          solo se la tua potenza di spruzzo sarà superiore alla sua.</p>

        <p class={"text-grey mt-5"}>Capacità di raccolta:</p>
        <p>Aumenta questo parametro per raccogliere più bombolette al secondo.
          Dovrai spenderne molte per uno spruzzo potente!
          E' sufficiente una bomboletta per coprire uno spazio vuoto, te ne serviranno 10
          per coprire un altro colore.
        </p>

        <p class={"text-grey mt-5"}>Velocità apprendimento:</p>
        <p>Aumenta questo parametro per avanzare di livello.
          Più è alto il tuo livello, più velocemente potrai accumulare bombolette e
          più forte spruzzerai.</p>


      </div>

      <button onClick={close} class={"mt-auto h-[3em] mt-3 w-full acquamarine-button"}>
        <Close/>&nbsp; Chiudi
      </button>
    </div>
  )
}

export default Instructions;
