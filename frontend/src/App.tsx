import type { Component } from 'solid-js';
import { Routes, Route } from "solid-app-router"
import {lazy, onMount} from "solid-js";
import {useAuthDispatch} from "./shared/context/auth.context";
import ViewerProvider from "./shared/context/viewer.context";
const BattleLayout = lazy(() => import("./shared/layout/BattleLayout"));
const Landing = lazy(() => import("./pages/Home"));
const Battle = lazy(() => import("./pages/battle/Battle"));
const Viewer = lazy(() => import("./pages/Viewer"));
const GameProvider = lazy(() => import( "./shared/context/game.context"));
const ScreenOrientationGuard = lazy(() => import( "./shared/guards/ScreenOrientationGuard"));

const battlePage = () => {
  return (
    <GameProvider>
      <ScreenOrientationGuard>
        <BattleLayout/>
      </ScreenOrientationGuard>
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
      <Route path="/battle" component={battlePage}>
        <Route path="" component={Battle}/>
      </Route>
      <Route path="/viewer" component={viewerPage} />
    </Routes>
  );
};

export default App;
