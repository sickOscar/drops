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

      <div class={"text-white"}>
        <p>
          Immagina un futuro distopico nel quale le Intelligenze Artificiali abbiano dominato ogni mestiere creativo sulla piazza.
        </p>

        <p class={"mt-5"}>
          Sei un artista. Sigh, sob.
          Non sai più come esprimere la tua creatività.
          Ma sei pur sempre un creativo e vuoi sfogare le tue abilità.
        </p>

        <p class={"mt-5"}>
          L’unica via d’uscita è fare i graffiti in ogni muro della città e riempire tutto con il tuo colore.
        </p>

        <p class={"mt-5"}>
          Hai i droni poliziotto alle calcagna e devi conquistare più muri possibile cercando di battere gli altri artisti in città che tenteranno di rubarti gli spazi a disposizione.
        </p>

        <p class={"mt-5"}>
          Hurry up!
        </p>

        <p class={"mt-5"}>
          Armati di bombolette, colori e vai di spray!
        </p>
      </div>
      <button onClick={authDispatch?.login} class={"h-[3em] mt-3 w-full acquamarine-button"}>
        Accedi con i social
      </button>
    </div>
  )
}

export default Home;
