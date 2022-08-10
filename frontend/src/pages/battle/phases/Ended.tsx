interface IntroProps {
  onPlayAgain: () => void
}

const Intro = ({onPlayAgain} : IntroProps) => {
  return (
    <>
      Thank you for playing!
      <br/>
      <button onClick={onPlayAgain}>
        Play again
      </button>
    </>
  )
}

export default Intro;
