import {Outlet, useNavigate} from "solid-app-router";
import {onMount} from "solid-js";
import {useAuthDispatch, useAuthState} from "../context/auth.context";
import logo from "../../assets/logo.png";
import {useGameState} from "../context/game.context";
import {isInGame, isInQueue} from "../helpers";

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
      <header class={"flex justify-between items-center h-[2.5em] mb-10"}>
        <span class={"text-white text-xl"}>
          {
            isInQueue(gameState) && (<>Prossimi giocatori</>)
          }
          {
            !isInQueue(gameState) && (<>Ciao {useAuth?.user?.name}</>)
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
