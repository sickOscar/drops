import type { Component } from 'solid-js';
import { Routes, Route } from "solid-app-router"
import {lazy, onMount} from "solid-js";
import {useAuthDispatch} from "./shared/context/auth.context";
import ViewerProvider from "./shared/context/viewer.context";
const BattleLayout = lazy(() => import("./shared/layout/BattleLayout"));
const Landing = lazy(() => import("./pages/Home"));
const Battle = lazy(() => import("./pages/battle/Battle"));
const Viewer = lazy(() => import("./pages/Viewer"));
const Login = lazy(() => import( "./pages/Login"));
const GameProvider = lazy(() => import( "./shared/context/game.context"));

const gamePage = () => {
  return (
    <GameProvider>
      <Battle/>
    </GameProvider>
  )
}

const viewerPage = () => {
  return (
    <ViewerProvider>
      <Viewer/>
    </ViewerProvider>
  )
}

const App: Component = () => {
  const authDispatch = useAuthDispatch();

  onMount(async () => {
    if (authDispatch?.isComingFromRedirect()) {
      await authDispatch?.handleRedirectCallback();
    }
  });

  return (
    <Routes>
      <Route path="/" component={Landing} />
      <Route path="/battle" component={BattleLayout}>
        <Route path="" component={gamePage}/>
      </Route>
      <Route path="/viewer" component={viewerPage} />
      <Route path="/auth/login" component={Login} />
    </Routes>
  );
};

export default App;
