import Info from "../icons/Info";
import {useUiDispatch} from "../context/ui.context";

const InstructionButton = () => {
  const uiDispatch = useUiDispatch();

  return (
    <button onClick={uiDispatch?.toggleInstruction} class={"acquamarine-button"}>
      <Info/>
    </button>
  )
}

export default InstructionButton;
