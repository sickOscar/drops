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
    p.setup = function() {
      const canvas = p.createCanvas(BOARD_SIZE * (CELL_SIZE), BOARD_SIZE * (CELL_SIZE));
      canvas.parent("field")
      p.frameRate(5);
    }

    p.draw = function () {
      p.background(81);

      if (viewerState && viewerState?.playersMap && Object.entries(viewerState?.playersMap).length > 0) {
        for (let i = 0; i < viewerState?.field.length; i++) {
          for (let j = 0; j < viewerState?.field[i].length; j++) {

            if (viewerState?.field[i][j] > 0) {
              p.fill(viewerState?.playersMap[viewerState?.field[i][j]].color);
            } else {
              p.fill(0);
            }

            p.rect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
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
                    <span class={"w-[20px] h-[20px]"} style={{"background-color": player.color}}></span>{player.score} {player.name}
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
