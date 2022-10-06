import {Outlet, useNavigate} from "solid-app-router";
import {onMount} from "solid-js";
import {useAuthDispatch, useAuthState} from "../context/auth.context";
import logo from "../../assets/logo.png";
import {useGameState} from "../context/game.context";
import {isInQueue} from "../helpers";
import PlayerImageRounded from "../components/PlayerImageRounded";

const BattleLayout = () => {
  const useAuth = useAuthState();
  const gameState = useGameState();
  const authDispatch = useAuthDispatch();
  const navigate = useNavigate();

  onMount(async () => {
    if (!useAuth?.isAuthenticated) {
      navigate("/", {replace: true});
    }
  });

  return (
    <>
      <header class={"flex justify-between items-center h-[2.5em] mb-4"}>
        <span class={"text-white text-xl"}>
          {
            isInQueue(gameState) && (<>Prossimi giocatori</>)
          }
          {
            !isInQueue(gameState) && (
              <div class={"flex items-center"}>
                <PlayerImageRounded player={{
                  name: useAuth?.user?.name || "",
                  avatar: useAuth?.user?.picture || "",
                  connected: true
                }}/>&nbsp;{useAuth?.user?.name}
              </div>
            )
          }
        </span>
        <img src={logo} class={"h-full object-cover"} alt=""/>
        {/*<button onClick={() => authDispatch?.logout()}>logout</button>*/}
      </header>
      <Outlet></Outlet>
    </>
  )
}

export default BattleLayout;
