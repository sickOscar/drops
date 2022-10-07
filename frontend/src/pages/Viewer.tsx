import * as QRCode from "qrcode";
import {createSignal, onCleanup, onMount} from "solid-js";
import {BOARD_SIZE, CELL_SIZE, HOSTNAME} from "../shared/constants";
import {useViewerState, ViewerStates} from "../shared/context/viewer.context";
import p5 from "p5";

const leftPad = (num:number) => {
  return num < 10 ? `0${num}` : num;
}

const Viewer = () => {
  const viewerState = useViewerState();
  const [p5Instance, setP5Instance] = createSignal<p5 | null>(null);
  let canvas;

  const gameIsRunning = () => {
    return viewerState?.gameState === ViewerStates.RUNNING;
  }

  const gameIsCountdown = () => {
    return viewerState?.gameState === ViewerStates.COUNTDOWN;
  }

  const gameIsDemo = () => {
    return viewerState?.gameState === ViewerStates.DEMO;
  }

  const gameIsOver = () => {
    return viewerState?.gameState === ViewerStates.OVER;
  }

  const sketch = (p: p5) => {

    const sqrtSide = Math.sqrt(2);

    const demoPlayers = {
      1: {
        color: "#4EC3CB",
        m: 0.33,
        p: 0.33,
        r: 0.34,
        res: 3000,
        starting: [5, 5]
      },
      2: {
        color: "#F2C94C",
        m: 0.33,
        p: 0.33,
        r: 0.34,
        res: 3000,
        starting: [50, 50]
      },
      3: {
        color: "#FF9457",
        m: 0.33,
        p: 0.33,
        r: 0.34,
        res: 3000,
        starting: [70, 20]
      },
      4: {
        color: "#FF6694",
        m: 0.33,
        p: 0.33,
        r: 0.34,
        res: 3000,
        starting: [80, 60]
      },
      5: {
        color: "#9F0B76",
        m: 0.33,
        p: 0.33,
        r: 0.34,
        res: 3000,
        starting: [30, 12]
      },
      6: {
        color: "#9896A5",
        m: 0.33,
        p: 0.33,
        r: 0.34,
        res: 3000,
        starting: [90, 90]
      },
    }

    const demoField: number[][] = [];


    const drawBackWall = () => {
      const brickWidth = 8;
      const brickHeight = 4;

      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          p.stroke(255);
          p.noFill();

          if (j % (brickHeight * 2) === 0) {
            if (i % (brickWidth) === 0) {
              p.rect(
                i * CELL_SIZE,
                j * CELL_SIZE,
                CELL_SIZE * brickWidth,
                CELL_SIZE * brickHeight
              );
            }
          }

          if (j % (brickHeight * 2) === brickHeight) {
            if (i % (brickWidth) === brickWidth / 2) {
              p.rect(
                i * CELL_SIZE,
                j * CELL_SIZE,
                CELL_SIZE * brickWidth,
                CELL_SIZE * brickHeight
              );
            }
          }

        }
      }
    }

    function drawField(field: number[][], players: any) {
      try {
        p.clear(0, 0, 0, 0.5);

        drawBackWall();

        p.noStroke();
        const perlinMultiplier = 0.3;

        if (!players || Object.entries(players).length === 0) {
          return;
        }

        for (let i = 0; i < field.length; i++) {
          for (let j = 0; j < field[i].length; j++) {

            if (players[field[i][j]] === undefined) {
              continue;
            }

            if (cleanedField[i][j] === 1) {
              continue;
            }

            if (field[i][j] > 0) {

              const c = p.color(players[field[i][j]].color);

              const alphaPerlin = p.noise(i * perlinMultiplier, j * perlinMultiplier);

              const maxI = Math.min(BOARD_SIZE - 1, i + 1);
              const maxJ = Math.min(BOARD_SIZE - 1, j + 1);

              const minI = Math.max(0, i - 1);
              const minJ = Math.max(0, j - 1);

              let closeToEnemy = false;

              for (let x = minI; x <= maxI; x++) {
                for (let y = minJ; y <= maxJ; y++) {

                  if (field[x][y] > 0 && field[x][y] !== field[i][j]) {
                    closeToEnemy = true;
                    break;
                  }
                }
                if (closeToEnemy) {
                  break;
                }
              }

              if (closeToEnemy) {
                c.setAlpha(100);
              } else {
                c.setAlpha(128 + p.map(alphaPerlin, 0, 1, 0, 128));
              }


              p.fill(c);

              const rayPerlin = p.map(p.noise(j, i), 0, 1, 0.7, 2.5);

              p.circle(
                i * CELL_SIZE,
                j * CELL_SIZE,
                CELL_SIZE * (sqrtSide * rayPerlin)
              );


            } else {
              p.fill(128);
            }

          }
        }


      } catch (err) {
        // un catch per domarli tutti
        // l'applicazione non deve crashare perchè non voglio andare a fare F5 sul pc
        // durante il contest
        console.error(err);
      }
    }

    let cleanedField: number[][] = [];
    let cleaningBotState = 'cleaning';
    let cleaningBotPosition = [0, 0];
    let cleaningBotEntered = false;
    let cleaningBotFrameOffset = 0;

    function resetCleaningBotState() {
      cleanedField = [];
      for (let i = 0; i < BOARD_SIZE; i++) {
        cleanedField[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
          cleanedField[i][j] = 0;
        }
      }
      cleaningBotEntered = false;
    }

    function moveCleaningBot() {

      const middle = ((BOARD_SIZE * CELL_SIZE) / 2);

      if (cleaningBotState === 'cleaning') {

        if (!cleaningBotEntered) {
          cleaningBotFrameOffset = p.frameCount;
          cleaningBotEntered = true;
        }

        const currentBotX = middle + Math.sin(p.frameCount / 10) * ((BOARD_SIZE * CELL_SIZE) / 2 - 50);
        const currentBotYIndex = (p.frameCount - cleaningBotFrameOffset) / 2 % BOARD_SIZE;

        cleaningBotPosition = [currentBotX, currentBotYIndex * CELL_SIZE];

        const n = p.noise(p.frameCount / 50);

        if (cleanedField) {
          for (let i = 0; i < BOARD_SIZE; i++) {
            cleanedField[i][currentBotYIndex] = 1;
          }
        }


        p.stroke('red');
        p.fill('rgba(255, 0, 0, 0.3)');
        p.rect(0, cleaningBotPosition[1] - 50, BOARD_SIZE * CELL_SIZE, 50);

        // p.line(0, cleaningBotPosition[1], BOARD_SIZE * CELL_SIZE, cleaningBotPosition[1]);
        // p.line(0, cleaningBotPosition[1] - 50, BOARD_SIZE * CELL_SIZE, cleaningBotPosition[1] - 50);

        for (let i = 0; i < 10; i++) {
          p.line(
            cleaningBotPosition[0],
            cleaningBotPosition[1],
            p.map(Math.random(), 0, 1, 0, BOARD_SIZE * CELL_SIZE),
            currentBotYIndex * CELL_SIZE - Math.random() * 50,
          )
        }

        p.translate(cleaningBotPosition[0], cleaningBotPosition[1]);
        p.rotate(Math.cos(p.frameCount / 10) * 0.5);
        p.image(botImage,
          -80,
          -40,
          50 * p.map(n, 0, 2, 2, 10),
          50 * p.map(n, 0, 2, 2, 10)
        );
        p.translate(-cleaningBotPosition[0], -cleaningBotPosition[1]);
      }


    }


    function resetDemo() {

      // set random starting for demoPlayers
      for (let p of Object.values(demoPlayers)) {
        p.starting = [Math.floor(Math.random() * (BOARD_SIZE - 1)), Math.floor(Math.random() * (BOARD_SIZE - 1))];
        p.m = Math.random();
        const rest = 1 - p.m;
        p.p = Math.random() * rest;
        p.r = rest - p.p;

      }

      for (let i = 0; i < BOARD_SIZE; i++) {
        demoField.push([]);
        for (let j = 0; j < BOARD_SIZE; j++) {
          demoField[i][j] = 0;

          // check if there is a player in this cell
          for (const player of Object.keys(demoPlayers)) {
            if (demoPlayers[player].starting[0] === i && demoPlayers[player].starting[1] === j) {
              demoField[i][j] = player as number;
              break;
            }
          }

        }
      }
    }


    function updateDemoCell(i: number, j: number) {
      if (demoField[i][j] === 0) {
        return;
      }

      const maxI = Math.min(BOARD_SIZE - 1, i + 1);
      const maxJ = Math.min(BOARD_SIZE - 1, j + 1);

      const minI = Math.max(0, i - 1);
      const minJ = Math.max(0, j - 1);

      // get random cell in defined boundaries
      const randomI = Math.floor(Math.random() * (maxI - minI + 1)) + minI;
      const randomJ = Math.floor(Math.random() * (maxJ - minJ + 1)) + minJ;

      if (demoField[randomI][randomJ] === 0) {
        demoField[randomI][randomJ] = demoField[i][j];
      } else {

        const thisCellPlayer = demoPlayers[demoField[i][j]];
        const enemyCellPlayer = demoPlayers[demoField[randomI][randomJ]];

        if (
          thisCellPlayer.m > enemyCellPlayer.m
          && thisCellPlayer.res > 10
          && Math.random() > 0.3
        ) {
          thisCellPlayer.res = thisCellPlayer.res - 10;
          demoField[randomI][randomJ] = demoField[i][j];
        }

      }
    }

    let botImage;

    p.preload = function () {
      botImage = p.loadImage(import.meta.env.PROD ? '/assets/drone.png' : '/src/assets/drone.png');
    }

    p.setup = function () {
      canvas = p.createCanvas(BOARD_SIZE * (CELL_SIZE), BOARD_SIZE * (CELL_SIZE));
      canvas.parent("field")
      resetDemo();
    }

    p.draw = function () {


      if (gameIsRunning()) {
        resetCleaningBotState();
        p.frameRate(4);
        drawField(viewerState.field, viewerState.playersMap);
        resetDemo();
      }

      if (gameIsDemo()) {
        resetCleaningBotState();

        p.frameRate(5);

        for (let i = 0; i < demoField.length; i++) {
          for (let j = 0; j < demoField[i].length; j++) {
            updateDemoCell(i, j);
          }
        }

        Object.values(demoPlayers).forEach(p => {
          p.res += 50;
        })

        let fullfilled = true;
        for (let i = 0; i < demoField.length; i++) {
          for (let j = 0; j < demoField[i].length; j++) {
            if (demoField[i][j] === 0) {
              fullfilled = false;
            }
          }
        }

        if (fullfilled) {
          resetDemo();
        }

        drawField(demoField, demoPlayers);

      }

      if (gameIsCountdown() || gameIsOver()) {
        p.frameRate(20);

        if (gameIsCountdown()) {
          drawField(demoField, demoPlayers);
        } else {
          drawField(viewerState.field, viewerState.playersMap);
        }

        moveCleaningBot();
      }

    }


  }

  onMount(async () => {
    setP5Instance(new p5(sketch));

    await QRCode.toCanvas(document.getElementById("qr-right"), `${HOSTNAME}/battle/`);
    await QRCode.toCanvas(document.getElementById("qr-left"), `${HOSTNAME}/battle/`);
  });

  onCleanup(() => {
    p5Instance()?.remove();
  });

  return (
    <>

      {gameIsOver() && (
        <div class="container absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div class="bg-purple-800 text-white text-center bg-opacity-70	p-5  text-xl ">
            <h1 class="text-3xl">
              Il miglior teppista è stato <br/>
              <span class="text-7xl">{
                viewerState && viewerState.playersMap && Object.values(viewerState.playersMap)
                  .sort((a, b) => b.score - a.score)[0].name
              }</span>

            </h1>
            {/*<h2>Hall of fame</h2>*/}
            {/*<div class="flex flex-col">*/}
            {/*  {*/}
            {/*    viewerState?.hallOfFame?.map((player, i) => (*/}
            {/*      <div class="w-[500px] flex flex-row justify-between">*/}
            {/*        <span class="text-2xl">{i + 1}.</span>*/}
            {/*        <span class="text-2xl">{player.name}</span>*/}
            {/*        <span class="text-2xl">{player.score}</span>*/}
            {/*      </div>*/}
            {/*    ))*/}
            {/*  }*/}
            {/*</div>*/}
          </div>
        </div>
      )}

      {viewerState && viewerState?.timeToStart > 0 &&
        <div class="container absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div class="bg-purple-800 text-white text-center bg-opacity-70	p-5  text-xl ">
            <h1 class="">
              La prossima vandalizzazione sta per cominciare!<br/>
              {viewerState.playersInQueue.length < 8 && <span>In attesa di altri giocatori...</span>}
            </h1>
            <div class="mt-8 flex justify-around">
              <div>
                <ul>
                  {Object.values(viewerState.playersInQueue).map(p => <li>{p.name}</li>)}
                </ul>
              </div>
              <div class="w-80">
                <span class="text-8xl">{viewerState?.timeToStart / 1000}</span><br/>
                <span>secondi</span>
              </div>
            </div>
          </div>
        </div>
      }
      <div class={"flex flex-row justify-center"}>
        <div id={"field"} ref={canvas}></div>
        <div class={"pl-4 text-white w-96 overflow-auto h-screen"}>

          {gameIsRunning() && <div class="ranking">

            <h3 class="mt-8 text-xl">
              Tempo rimasto <br />
              <span class="text-7xl">{
                leftPad(Math.floor(Math.round(useViewerState()?.remainingTime / 2) / 60))
              }:{
                leftPad(Math.round(useViewerState()?.remainingTime / 2) % 60)
              }</span>
            </h3>

            <h1 class="text-xl mt-8">Classifica</h1>
            <ol>
              {
                Object.values(useViewerState()?.playersMap || [])
                  .sort((a, b) => b.score - a.score)
                  .map((player, i) => (
                    <li class={`flex text-2xl mb-3`}>
                      <span class="mr-4">{i + 1}</span>
                      <span class={"w-[20px] h-[20px] mr-4"}
                          style={{"background-color": player.color}}></span>
                      <span class={`w-[250px]`}>{player.name.substring(0, 20)}</span>
                      <span class={"w-[100px]"}>{player.score}</span>
                    </li>
                  ))
              }
            </ol>

          </div>
          }

          {!gameIsRunning() &&
          <div class="mt-8 text-3xl">
            <h2>Join the game!</h2>
            <p>Scannerizza i QR code</p>
          </div>
          }


        </div>
      </div>
      <canvas id="qr-left" class={"fixed bottom-0 left-0"}></canvas>
      <canvas id="qr-right" class={"fixed bottom-0 right-0"}></canvas>
    </>
  )
}

export default Viewer;
