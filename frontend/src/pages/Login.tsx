import {useAuthDispatch, useAuthState} from "../shared/context/auth.context";
import {createEffect} from "solid-js";
import {useNavigate} from "solid-app-router";

const Login = () => {
  const authDispatch = useAuthDispatch();
  const authState = useAuthState();
  const navigate = useNavigate();

  createEffect(() => {
    if (authState?.isAuthenticated) {
      navigate("/battle", {replace: true});
    }
  })

  return (
    <>
      <button onClick={() => authDispatch?.login()}
              style={"bg-blue-300 p-5"}>
        Auth pls
      </button>
    </>
  )
}

export default Login;
