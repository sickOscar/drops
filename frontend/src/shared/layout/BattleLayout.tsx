import {Outlet, useNavigate} from "solid-app-router";
import {onMount} from "solid-js";
import {useAuthDispatch, useAuthState} from "../context/auth.context";

const BattleLayout = () => {
  const useAuth = useAuthState();
  const authDispatch = useAuthDispatch();
  const navigate = useNavigate();

  onMount(async () => {
    if (!useAuth?.isAuthenticated) {
      navigate("/auth/login", {replace: true});
    }
  });

  return (
    <>
      <div class={"flex justify-end"}>
        <button onClick={() => authDispatch?.logout()}>logout</button>
      </div>
      <Outlet></Outlet>
    </>
  )
}

export default BattleLayout;
