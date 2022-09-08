/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from "solid-app-router";
import './index.css';
import App from './App';
import AuthProvider from "./shared/context/auth.context";
import bg from "./assets/bg.png";

render(() =>
  <Router>
    <AuthProvider>
      <img class="bg-image" src={bg} alt=""/>
      <App/>
    </AuthProvider>
  </Router>,
  document.getElementById('root') as HTMLElement
);
