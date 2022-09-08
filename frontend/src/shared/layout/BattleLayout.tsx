import {Outlet, useNavigate} from "solid-app-router";
import {onMount} from "solid-js";
import {useAuthDispatch, useAuthState} from "../context/auth.context";
import logo from "../../assets/logo.png";
import {useGameState} from "../context/game.context";

const BattleLayout = () => {
  const useAuth = useAuthState();
  const gameState = useGameState();
  const authDispatch = useAuthDispatch();
  const navigate = useNavigate();

  onMount(async () => {
    if (!useAuth?.isAuthenticated) {
      navigate("/auth/login", {replace: true});
    }
  });

  return (
    <>
      <div class={"flex justify-between items-center h-[2.5em] mb-10"}>
        <span class={"text-white text-xl"}>Ciao {useAuth?.user?.name}</span>
        <img src={logo} class={"h-full object-contain"} alt=""/>
        {/*<button class={"hidden"} onClick={() => authDispatch?.logout()}>logout</button>*/}
      </div>
      <Outlet></Outlet>
    </>
  )
}

export default BattleLayout;