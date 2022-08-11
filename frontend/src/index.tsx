/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from "solid-app-router";
import './index.css';
import App from './App';
import AuthProvider from "./shared/context/auth.context";

render(() =>
  <Router>
    <AuthProvider>
      <App/>
    </AuthProvider>
  </Router>,
  document.getElementById('root') as HTMLElement
);
