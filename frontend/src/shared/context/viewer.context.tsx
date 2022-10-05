import {createContext, createEffect, onCleanup, onMount, Show, useContext} from "solid-js";
import {createStore} from "solid-js/store";
import {io, Socket} from "socket.io-client";
import {MULTIPLAYER_HOST_VIEWER, VIEWER_SOCKETS} from "../constants";
import {BattleInfoCurrentPlayer} from "../../models/user";

interface ViewerDispatchContext {
}

interface HallOfFameEntry {
  name: string;
  score: number;
}

interface ViewerStateContext {
  socket: Socket | null,
  bootstrapped: boolean,
  field: number[][],
  playersMap: { [key: string | number]: BattleInfoCurrentPlayer } | undefined,
  round: number,
  remainingTime: number,
  playersInQueue: any[],
  timeToStart: number,
  gameState: ViewerStates
  hallOfFame: HallOfFameEntry[]
}

export enum ViewerStates {
  RUNNING = "RUNNING",
  DEMO = "DEMO",
  COUNTDOWN = "COUNTDOWN",
  OVER = "OVER"
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
  remainingTime: 0,
  playersInQueue: [],
  timeToStart: 0,
  gameState: ViewerStates.DEMO,
  hallOfFame: []
}

const ViewerLoader = () => {
  return (
    <>
      Loading...
    </>
  )
}

let runningTimeout

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
        path: import.meta.env.PROD ? '/viewersocket/socket.io' : '',
        autoConnect: true
      });
    });
  }

  const listenWebSockets = () => {
    store.socket?.on(VIEWER_SOCKETS.FIELD, (data) => {
      try {
        setStore("field", JSON.parse(data));
        setStore("gameState", ViewerStates.RUNNING);

        clearTimeout(runningTimeout);
        runningTimeout = setTimeout(() => {
          setStore("gameState", ViewerStates.DEMO);
        }, 15000);

      } catch (err) {
        console.log("Failed parsing field data");
      }
    });

    store.socket?.on(VIEWER_SOCKETS.PLAYERS, (players) => {
      setStore("playersMap", undefined);

      let map: { [key: string]: BattleInfoCurrentPlayer } = {};

      players.forEach((player: BattleInfoCurrentPlayer) => {
        // @ts-ignore
        map[Number(player.id)] = player;
      });

      setStore("playersMap", (old) => map);
    });

    store.socket?.on(VIEWER_SOCKETS.TIME, (time) => {
      setStore("remainingTime", Number(time));
    });

    store.socket?.on(VIEWER_SOCKETS.PLAYING_PLAYERS, (players) => {
      setStore("playersInQueue", JSON.parse(players));
    })

    store.socket?.on(VIEWER_SOCKETS.TIME_TO_START, (time) => {
      setStore("timeToStart", Number(time));
      clearTimeout(runningTimeout);
      setStore("gameState", ViewerStates.COUNTDOWN);
    });

    store.socket?.on(VIEWER_SOCKETS.BATTLE_END, () => {
      console.log('BATTLE END');
      setStore("gameState", ViewerStates.OVER);
    })

    store.socket?.on(VIEWER_SOCKETS.ENDGAME, () => {
      console.log('ENDGAME');
      setStore("gameState", ViewerStates.DEMO);
    })

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
