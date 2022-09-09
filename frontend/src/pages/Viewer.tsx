import * as QRCode from "qrcode";
import {createSignal, onCleanup, onMount} from "solid-js";
import {BOARD_SIZE, CELL_SIZE, HOSTNAME} from "../shared/constants";
import {useViewerState} from "../shared/context/viewer.context";
import p5 from "p5";

const Viewer = () => {
  const viewerState = useViewerState();
  const [p5Instance, setP5Instance] = createSignal<p5 | null>(null);
  let canvas;

  const sketch = (p: p5) => {

    const sqrtSide = Math.sqrt(2);

    p.setup = function () {
      const canvas = p.createCanvas(BOARD_SIZE * (CELL_SIZE), BOARD_SIZE * (CELL_SIZE));
      canvas.parent("field")
      p.frameRate(20);



    }

    p.draw = function () {
      p.background(128);

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

      p.noStroke();
      const perlinMultiplier = 0.1;

      if (viewerState && viewerState?.playersMap && Object.entries(viewerState?.playersMap).length > 0) {
        for (let i = 0; i < viewerState?.field.length; i++) {
          for (let j = 0; j < viewerState?.field[i].length; j++) {


            if (viewerState?.field[i][j] > 0) {
              const c = p.color(viewerState?.playersMap[viewerState?.field[i][j]].color);

              const perlin = p.noise(i * perlinMultiplier, j * perlinMultiplier);

              c.setAlpha(128 + p.map(perlin, 0, 1, 0, 128));
              p.fill(c);

              const rayPerlin = p.map(p.noise(j, i), 0, 1, 0.7, 1.5);

              p.circle(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE * sqrtSide * rayPerlin);



            } else {
              p.fill(128);
            }

          }
        }
      }

      // p.filter(p.DILATE);
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
      <div class={"flex flex-row"}>
        <div id={"field"} ref={canvas}></div>
        <div>
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
