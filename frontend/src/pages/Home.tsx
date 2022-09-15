import {Link, useNavigate} from "solid-app-router";
import logo from "../assets/logo.png";
import {useAuthDispatch, useAuthState} from "../shared/context/auth.context";
import {createEffect} from "solid-js";

const Home = () => {
  const authDispatch = useAuthDispatch();
  const authState = useAuthState();
  const navigate = useNavigate();

  createEffect(() => {
    if (authState?.isAuthenticated) {
      navigate("/battle", {replace: true});
    }
  })

  return (
    <div class="h-full w-full flex flex-col justify-center items-center">
      <img src={logo} alt="logo" class={"h-[5em]"}/>

      <h1 class="text-2xl text-white text-center my-10">Are <span class={"text-orange-400"}>y</span>ou ready to <span class={"text-orange-400"}>s</span>pray?</h1>

      <div class={"text-white overflow-y-auto"}>
        <p>
          Corre l’anno 2099.
        </p>

        <p class={"mt-5"}>
          Le Intelligenze Artificiali dominano ogni mestiere creativo sulla piazza.
        </p>

        <p class={"mt-5"}>
          Sei un artista.
          <br/>
          Non sai più come esprimere la creatività.
          <br/>
          Argh.
        </p>

        <p class={"mt-5"}>
          Unica via d’uscita: imbratta ogni muro della città e riempi tutto di colore.
        </p>

        <p class={"mt-5"}>
          Attento! Hai i droni poliziotto alle calcagna.
        </p>

        <p class={"mt-5"}>
          Conquista più muri che puoi battendo sul tempo gli altri artisti che provano a rubarti i muri disponibili.
        </p>

        <p class={"mt-5"}>
          Hurry up!
        </p>

        <p class={"mt-5"}>
          Armati di bombolette, colori e... vai di spray!
        </p>
      </div>
      <button onClick={authDispatch?.login} class={"h-[3em] mt-3 w-full acquamarine-button"}>
        Accedi con i social
      </button>
    </div>
  )
}

export default Home;
