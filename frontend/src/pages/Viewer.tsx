import * as QRCode from "qrcode";
import {createSignal, onCleanup, onMount} from "solid-js";
import {BOARD_SIZE, CELL_SIZE, HOSTNAME} from "../shared/constants";
import {useViewerState} from "../shared/context/viewer.context";
import p5 from "p5";

const Viewer = () => {
  const viewerState = useViewerState();
  const [p5Instance, setP5Instance] = createSignal<p5 | null>(null);
  let canvas;

  const gameIsRunning = () => {
    return false;
  }



  const sketch = (p: p5) => {

    const sqrtSide = Math.sqrt(2);


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
        const perlinMultiplier = 0.5;

        if (!players || Object.entries(players).length === 0) {
          return;
        }

        for (let i = 0; i < field.length; i++) {
          for (let j = 0; j < field[i].length; j++) {


            if (field[i][j] > 0) {

              const c = p.color(players[field[i][j]].color);

              const perlin = p.noise(i * perlinMultiplier, j * perlinMultiplier);

              c.setAlpha(128 + p.map(perlin, 0, 1, 0, 128));
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

    let font;

    p.setup = function () {
      canvas = p.createCanvas(BOARD_SIZE * (CELL_SIZE), BOARD_SIZE * (CELL_SIZE));
      canvas.parent("field")

    }



    const demoPlayers = {
      1: {
        color: "#4EC3CB",
        m: 0.33,
        p: 0.33,
        r: 0.34,
        starting: [5, 5]
      },
      2: {
        color: "#F2C94C",
        m: 0.33,
        p: 0.33,
        r: 0.34,
        starting: [50, 50]
      },
      3: {
        color: "#FF9457",
        m: 0.33,
        p: 0.33,
        r: 0.34,
        starting: [70, 20]
      },
      4: {
        color: "#FF6694",
        m: 0.33,
        p: 0.33,
        r: 0.34,
        starting: [80, 60]
      },
      5: {
        color: "#9F0B76",
        m: 0.33,
        p: 0.33,
        r: 0.34,
        starting: [30, 12]
      },
      6: {
        color: "#9896A5",
        m: 0.33,
        p: 0.33,
        r: 0.34,
        starting: [90, 90]
      },
    }

    const demoField:number[][] = [];

    function resetDemoField() {

      // set random starting for demoPlayers
      for (let p of Object.values(demoPlayers)) {
        p.starting = [Math.floor(Math.random() * (BOARD_SIZE - 1)), Math.floor(Math.random() * (BOARD_SIZE -1) )];
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

    resetDemoField();



    p.draw = function () {

      if (gameIsRunning()) {
        p.frameRate(4);
        drawField(viewerState.field, viewerState.playersMap);

      } else {

        p.frameRate(5);

        for (let i = 0; i < demoField.length; i++) {
          for (let j = 0; j < demoField[i].length; j++) {

            if (demoField[i][j] === 0) {
              continue;
            }

            const player = demoPlayers[demoField[i][j]];

            const maxI = Math.min(BOARD_SIZE - 1 , i + 1);
            const maxJ = Math.min(BOARD_SIZE - 1, j + 1);

            const minI = Math.max(0, i - 1);
            const minJ = Math.max(0, j - 1);

            // get random cell in defined boundaries
            const randomI = Math.floor(Math.random() * (maxI - minI + 1)) + minI;
            const randomJ = Math.floor(Math.random() * (maxJ - minJ + 1)) + minJ;

            if (demoField[randomI][randomJ] === 0) {
              demoField[randomI][randomJ] = demoField[i][j];
            }

          }
        }

        let fullfilled = true;
        for (let i = 0; i < demoField.length; i++) {
          for (let j = 0; j < demoField[i].length; j++) {
            if (demoField[i][j] === 0) {
              fullfilled = false;
            }
          }
        }

        if (fullfilled) {
          resetDemoField();
        }


        drawField(demoField, demoPlayers);


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
      {viewerState && viewerState?.timeToStart > 0 &&

        <div class="container absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div class="bg-purple-400 bg-opacity-70	p-5">
            <h1 class="text-white text-center text-l">
              The next vandalism will start in <span class="text-xl">{viewerState?.timeToStart / 1000}</span> seconds
            </h1>
          </div>
        </div>
      }
      <div class={"flex flex-row"}>
        <div id={"field"} ref={canvas}></div>
        <div class={"text-white"}>
          <h2>Ranking</h2>
          <ol>
            {
              Object.values(useViewerState()?.playersMap || [])
                .sort((a, b) => b.score - a.score)
                .map(player => (
                  <li class={"flex"}>
                    <span class={"w-[20px] h-[20px]"}
                          style={{"background-color": player.color}}></span>{player.score} {player.name}
                  </li>
                ))
            }
          </ol>

          <h3>Time left {useViewerState()?.remainingTime}/600</h3>
        </div>
      </div>
      <canvas id="qr-left" class={"fixed bottom-0 left-0"}></canvas>
      <canvas id="qr-right" class={"fixed bottom-0 right-0"}></canvas>
    </>
  )
}

export default Viewer;
