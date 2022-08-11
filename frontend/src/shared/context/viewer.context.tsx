import {createContext, createEffect, onCleanup, onMount, Show, useContext} from "solid-js";
import {createStore} from "solid-js/store";
import {io, Socket} from "socket.io-client";
import {MULTIPLAYER_HOST_VIEWER, VIEWER_SOCKETS} from "../constants";
import {BattleInfoCurrentPlayer} from "../../models/user";

interface ViewerDispatchContext {}

interface ViewerStateContext  {
  socket: Socket | null,
  bootstrapped: boolean,
  field: number[][],
  playersMap: {[key: string | number]: BattleInfoCurrentPlayer} | undefined,
  round: number,
  remainingTime: number
}

interface ViewerProviderProps {
  children: any
}

const ViewerDispatchContext = createContext<ViewerDispatchContext>();
const ViewerStateContext = createContext<ViewerStateContext>();

const initialState: ViewerStateContext = {
  socket: null,
  bootstrapped: false,
  field: [],
  playersMap: {},
  round: 0,
  remainingTime: 0
}

const ViewerLoader = () => {
  return (
    <>
      Loading...
    </>
  )
}

const ViewerProvider = (props: ViewerProviderProps) => {
  const [store, setStore] = createStore<ViewerStateContext>(initialState);

  onMount(() => {
    init();
  });

  onCleanup(() => {
    console.log("[VIEWER] remove websockets");
    store.socket?.off(VIEWER_SOCKETS.FIELD);
    store.socket?.off(VIEWER_SOCKETS.PLAYERS);
    store.socket?.off(VIEWER_SOCKETS.TIME);
  });

  createEffect(() => {
    if (store.socket) {
      listenWebSockets();
      setStore("bootstrapped", true);
    }
  })

  const init = () => {
    console.log("[VIEWER] init context");

    setStore("socket", (prev) => {
      return io(MULTIPLAYER_HOST_VIEWER, {
        autoConnect: true
      });
    });
  }

  const listenWebSockets = () => {
    store.socket?.on(VIEWER_SOCKETS.FIELD, (data) => {
      try {
        setStore("field", JSON.parse(data));
      } catch (err) {
        console.log("Failed parsing field data");
      }
    });

    store.socket?.on(VIEWER_SOCKETS.PLAYERS, (players) => {
      setStore("playersMap", undefined);

      let map: {[key: string]: BattleInfoCurrentPlayer} = {};

      players.forEach((player: BattleInfoCurrentPlayer) => {
        // @ts-ignore
        map[Number(player.id)] = player;
      });

      setStore("playersMap", (old) => map);
    });

    store.socket?.on(VIEWER_SOCKETS.TIME, (time) => {
      setStore("remainingTime", Number(time));
    });
  }

  return (
    <ViewerStateContext.Provider value={store}>
      <ViewerDispatchContext.Provider value={{}}>
        <Show when={store.bootstrapped} fallback={ViewerLoader}>
          {props.children}
        </Show>
      </ViewerDispatchContext.Provider>
    </ViewerStateContext.Provider>
  )
}

export default ViewerProvider;

export const useViewerState = () => useContext(ViewerStateContext);
export const useViewerDispatch = () => useContext(ViewerDispatchContext);
