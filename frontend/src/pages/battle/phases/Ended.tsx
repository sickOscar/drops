interface IntroProps {
  onPlayAgain: () => void
}

const Intro = ({onPlayAgain} : IntroProps) => {
  return (
    <div class={"text-white"}>
      Thank you for playing!
      <br/>
      <button onClick={onPlayAgain}>
        Play again
      </button>
    </div>
  )
}

export default Intro;
