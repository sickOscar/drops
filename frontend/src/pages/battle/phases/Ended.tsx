interface IntroProps {
  onPlayAgain: () => void
}

const Ended = ({onPlayAgain} : IntroProps) => {
  return (
    <div class={"text-white"}>
      <p>
        Grazie per aver giocato!
      </p>

      <button class={"h-[3em] mt-10 w-full acquamarine-button"} onClick={onPlayAgain}>
        Gioca ancora
      </button>
    </div>
  )
}

export default Ended;
