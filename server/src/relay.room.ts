import {Client, Room} from "colyseus";
import {Queue} from "./queue";
import http from "http";
import {Player, RelayState} from "./state";
import {coreListeningSocket} from "./ipc_sockets";
import {restoreTruncatedMessage} from "./message-handling";
import {Globals} from "./global";

export class DropRelayRoom extends Room<RelayState> { // tslint:disable-line

  public allowReconnectionTime: number = 0;
  autoDispose = false;

  waitingPlayers = new Queue<Player>();
  playingPlayers = new Set<string>();

  waitingListMissingTime = 0;
  waitingListTimeout: NodeJS.Timeout;
  waitingListTimer: NodeJS.Timer;

  public onCreate(_options: Partial<{
    maxClients: number,
    allowReconnectionTime: number,
    metadata: any,
  }>) {
    console.log('Creating Relay Room...');

    this.setState(new RelayState());

    let lastRemainingToken = "";
    coreListeningSocket
      .then(socket => socket.on('data', (data) => {

        // more than one message may be mixed on a single send due to how socket is buffered
        const incomingMessages = data.toString().split('\n');

        lastRemainingToken = restoreTruncatedMessage(incomingMessages, lastRemainingToken);

        incomingMessages
          .filter(message => message.length > 0)
          .forEach(message => {
            if (message.startsWith("*endgame:")) {
              this.state.gameRunning = false;
            }
          })
      }));

    this.onMessage("identity", (client, data) => {

      const [sub, name, avatar] = data.split("#");

      console.log(`RELAY: got player identity`, sub, name, avatar)

      let player = DropRelayRoom.createPlayerOnJoin(client, sub, name, avatar);

      if (this.playerAlreadyExists(sub)) {
        player = this.handlePlayerReconnection(player, client);

        if (this.playerShouldEnterBattleOnConnect(player)) {

          this.sendPlayerToBattle(client);

        } else {
          this.putPlayerInWaitingList(player);

          if (!this.isGameRunning() && this.hasEnoughConnectedPlayers()) {
            this.startGameTimer();
            this.startBroadcastTimer();
          }

        }

      } else {

        this.handleNewPlayerJoining(player);
        this.putPlayerInWaitingList(player);

        if (!this.isGameRunning() && this.hasEnoughConnectedPlayers()) {
          this.startGameTimer();
          this.startBroadcastTimer();
        }


      }

      this.broadcatsQueue();

    })

    this.presence.subscribe('battle_state', (state) => {
      if (state === 'endgame') {
        this.state.gameRunning = false;
        this.playingPlayers.clear();
      }
    })

    console.log('Relay Room created');
  }

  private startBroadcastTimer() {
    this.waitingListMissingTime = Globals.GAME_WAITING_TIME;
    this.waitingListTimer = setInterval(() => {
      this.waitingListMissingTime -= 1000;
      console.log('Broadcasting waiting list timer', this.waitingListMissingTime);
      this.broadcast('timer', this.waitingListMissingTime);

      const viewerSocket = Globals.viewerSocket;
      if (!viewerSocket) {
        return;
      }

      viewerSocket.emit('timer', this.waitingListMissingTime);

    }, 1000);
  }

  private endBroadcastTimer() {
    console.log('Ending waiting list timer');
    clearInterval(this.waitingListTimer);
  }

  public onAuth(client: Client, options: any, request: http.IncomingMessage) {
    return true;
  }

  public async onJoin(client: Client, options: any = {}) {
    return true;
  }

  public async onLeave(client: Client, consented: boolean) {

    let p: Player;
    this.state.players.forEach((player, key) => {
      if (player.sessionId === client.sessionId) {
        p = player;
      }
    });

    if (p) {
      p.connected = false;
      this.state.players.set(p.sub, p);

      const leavingWaitingPlayer = this.waitingPlayers.find(waitinggPlayer => waitinggPlayer.sub === p.sub);
      if (leavingWaitingPlayer) {
        leavingWaitingPlayer.connected = false;
      }

      this.broadcatsQueue();
      console.log(`${p.name} left relay`);
    }

  }

  private startGameTimer() {

    if (this.waitingListTimeout) {
      console.log('Clearing waiting list timeout');
      clearTimeout(this.waitingListTimeout);
      clearInterval(this.waitingListTimer);
    }

    console.log('Starting new waiting list timeout');
    this.waitingListTimeout = setTimeout(() => {
      if (this.shouldStartNewGame()) {
        this.startNewGame();
      } else {
        this.startGameTimer();
      }
    }, Globals.GAME_WAITING_TIME + 500);

  }

  private broadcatsQueue() {
    this.broadcast('queue', this.waitingPlayers.toArray()
      .map(p => `${p.name}|${p.connected}|${p.avatar}`)
    );
  }

  private startNewGame() {
    this.state.gameRunning = true;
    this.endBroadcastTimer();

    const waiting = this.waitingPlayers.toArray();
    console.log(`players`, waiting.map(p => p.name));

    const newWaitingPlayersQueue = new Queue<Player>();
    // let addedPlayers = 0;

    Globals.playersForThisGame = Math.min(Globals.MAX_PLAYERS_NUMBER, waiting.length);

    for (let i = 0; i < waiting.length; i++) {

      const player = waiting[i];

      if (!player) {
        continue;
      }

      if (i < Globals.MAX_PLAYERS_NUMBER) {
        this.playingPlayers.add(player.sub);

        const involvedClient = this.clients.find(client => client.sessionId === player.sessionId)
        involvedClient.send("battle_ready");

        // addedPlayers++;
        // if (addedPlayers === Globals.MAX_PLAYERS_NUMBER) {
        //   break;
        // }
      } else {
        newWaitingPlayersQueue.enqueue(player);
      }

    }

    this.waitingPlayers = newWaitingPlayersQueue;

  }

  private putPlayerInWaitingList(player: Player) {
    if (!this.waitingPlayers.has(p => p.sub === player.sub)) {
      this.waitingPlayers.enqueue(player);
    }
  }

  private handleNewPlayerJoining(player: Player) {
    this.state.players.set(player.sub, player);
    console.log(`${player.name} joined relay`);
  }

  private sendPlayerToBattle(client: Client) {
    // if it is, tell the player client to reconnect to the game
    client.send("battle_ready", true);
  }

  private playerAlreadyExists(sub: string) {
    return this.state.players.has(sub);
  }

  private playerShouldEnterBattleOnConnect(player: Player) {
    return this.isGameRunning() && this.playingPlayers.has(player.sub);
  }

  private handlePlayerReconnection(player: Player, client: Client) {
    player = this.state.players.get(player.sub);
    player.sessionId = client.sessionId;
    player.connected = true;
    console.log(`${player.name} reconnected`);
    return player;
  }

  private static createPlayerOnJoin(client: Client, sub, name, avatar: string) {
    let player = new Player();
    player.connected = true;
    player.sessionId = client.sessionId;
    player.sub = sub;
    player.name = name;
    player.avatar = avatar;
    return player;
  }

  private shouldStartNewGame() {
    return !this.isGameRunning() && this.hasEnoughPlayers();
  }


  private isGameRunning() {
    return this.state.gameRunning;
  }

  private hasEnoughPlayers() {
    return this.waitingPlayers.size() >= Globals.MIN_PLAYERS_NUMBER;
  }

  private hasEnoughConnectedPlayers() {
    return this.waitingPlayers.toArray().filter(p => p.connected).length >= Globals.MIN_PLAYERS_NUMBER;
  }

  onDispose() {
    console.log('onDispose relay');
  }

}
