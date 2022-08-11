import {createContext, createSignal, onMount, useContext, Show} from "solid-js";
import createAuth0Client, {Auth0Client, User} from "@auth0/auth0-spa-js";
import authConfig from "../auth.config";
import {AUTH_REDIRECT_URI} from "../constants";
import {createStore} from "solid-js/store";
import {useNavigate} from "solid-app-router";
import Login from "../../pages/Login";
import LoginLoader from "../components/LoginLoader";

interface AuthDispatchContext {
  login: () => Promise<void>
  logout: () => Promise<void>
  getUser: () => Promise<User | undefined>
  getToken: () => Promise<string | undefined>
  isAuthenticated: () => Promise<boolean | undefined>
  handleRedirectCallback: () => Promise<void>
  isComingFromRedirect: () => boolean
}

interface AuthStateContext {
  loading: boolean,
  isAuthenticated: boolean,
  user: User | undefined
}

const AuthDispatchContext = createContext<AuthDispatchContext>();
const AuthStateContext = createContext<AuthStateContext>();

const initialState: AuthStateContext = {
  loading: true,
  isAuthenticated: false,
  user: undefined
}

interface AuthProviderProps {
  children: any
}

const AuthProvider = (props: AuthProviderProps) => {
  const [store, setStore] = createStore(initialState);
  const [authClient, setAuthClient] = createSignal<Auth0Client | undefined>(undefined);
  const navigate = useNavigate();

  onMount(async () => {

    await configureClient();
    await checkLoginStatus();

    setStore("loading", false);

    console.log("[AUTH] finished login loading")
  });

  async function checkLoginStatus() {
    const isAuthenticated = await authClient()?.isAuthenticated();

    console.log("[AUTH] user is auth", isAuthenticated)

    if (typeof isAuthenticated === "boolean") {
      const user = await authClient()?.getUser()
      setStore("isAuthenticated", isAuthenticated);
      setStore("user", user);
    }
  }

  async function configureClient() {
    console.log("[AUTH] configuring oauth client")

    const client = await createAuth0Client({
      domain: authConfig.domain,
      client_id: authConfig.clientId,
      cacheLocation: "localstorage"
    });

    setAuthClient(client);

    console.log("[AUTH] configured oauth client")
  }

  async function login() {
    console.log("[AUTH] init login flow")

    await authClient()?.loginWithPopup();
    await checkLoginStatus();

    console.log("[AUTH] finished login flow")
  }

  async function logout() {
    await authClient()?.logout({
      returnTo: AUTH_REDIRECT_URI
    });

    setStore("isAuthenticated", false);
  }

  async function isAuthenticated() {
    return authClient()?.isAuthenticated();
  }

  async function getUser() {
    return authClient()?.getUser();
  }

  async function getToken() {
    return authClient()?.getTokenSilently();
  }

  function isComingFromRedirect() {
    const query = window.location.search;
    return query.includes("code=") && query.includes("state=");
  }

  async function handleRedirectCallback() {
    await authClient()?.handleRedirectCallback();
    navigate("/battle", {replace: true});
  }

  return (
    <AuthStateContext.Provider value={store}>
      <AuthDispatchContext.Provider
        value={{
          logout,
          login,
          getToken,
          getUser,
          isAuthenticated,
          isComingFromRedirect,
          handleRedirectCallback
        }}
      >
        <Show when={!store.loading} fallback={LoginLoader}>
          {props.children}
        </Show>
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  )
}

export default AuthProvider;

export const useAuthState = () => useContext(AuthStateContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);
