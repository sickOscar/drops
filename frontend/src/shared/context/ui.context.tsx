import {createContext, Show, useContext} from "solid-js";
import {createStore} from "solid-js/store";
import Instructions from "../components/Instructions";

interface UiDispatchContext {
  toggleInstruction: () => void
}

interface UiStateContext {
  showInstruction: boolean
}

const UiDispatchContext = createContext<UiDispatchContext>();
const UiStateContext = createContext<UiStateContext>();

const initialState: UiStateContext = {
  showInstruction: false
}

interface UiProviderProps {
  children: any
}

const UiProvider = (props: UiProviderProps) => {
  const [store, setStore] = createStore(initialState);

  function toggleInstruction() {
    setStore("showInstruction", prev => !prev);
  }

  return (
    <UiStateContext.Provider value={store}>
      <UiDispatchContext.Provider value={{toggleInstruction}}>
        <Show when={store.showInstruction}>
          <Instructions/>
        </Show>

        {props.children}
      </UiDispatchContext.Provider>
    </UiStateContext.Provider>
  )
}

export default UiProvider;
export const useUiState = () => useContext(UiStateContext);
export const useUiDispatch = () => useContext(UiDispatchContext);
