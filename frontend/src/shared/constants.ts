const url = new URL(window.location.href);
const HOSTNAME = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
const HOSTNAME_NO_PROTOCOL = `${url.hostname}${url.port ? `:${url.port}` : ''}`;
const AUTH_REDIRECT_URI = `${HOSTNAME}`;
enum SLIDER_TYPE {
  MILITARY = "military",
  PRODUCTION = "production",
  RESEARCH = "research"
}
const DEVELOPMENT_AT_END_ROUND = 5;
const RESOURCES_AT_END_ROUND = 50;
const RELAY_ROOM = {
  QUEUE: "queue",
  IDENTITY: "identity",
  BATTLE_READY: "battle_ready"
};

const BATTLE_ROOM = {
  BATTLE_START: "battle_start",
  IDENTITY: "identity",
  ACTION: "action",
  END_GAME: "endgame"
};

const VIEWER_SOCKETS = {
  FIELD: "field",
  TIME: "time",
  PLAYERS: "players"
}

const LOCALSTORAGE = {
  BATTLE_SESSION: "battle_session",
  BATTLE_SESSION_ID: "battle_session_id",
  BATTLE_ROOM_ID: "battle_room_id"
};
const CELL_SIZE = 9;
const BOARD_SIZE = 100;

const MULTIPLAYER_HOST = import.meta.env.VITE_MULTIPLAYER_HOST_GAME;
const MULTIPLAYER_HOST_VIEWER = import.meta.env.VITE_MULTIPLAYER_HOST_VIEWER;

export {url, CELL_SIZE, BOARD_SIZE, VIEWER_SOCKETS, HOSTNAME, HOSTNAME_NO_PROTOCOL, AUTH_REDIRECT_URI, SLIDER_TYPE, RESOURCES_AT_END_ROUND, DEVELOPMENT_AT_END_ROUND, RELAY_ROOM, BATTLE_ROOM, LOCALSTORAGE, MULTIPLAYER_HOST, MULTIPLAYER_HOST_VIEWER};
