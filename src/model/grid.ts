import { EventEmitter } from "eventemitter3";
import { Player } from "./player";

export class Grid extends EventEmitter {
  hSubDiv: number;
  vSubDiv: number;
  width: number = 0;
  height: number = 0;
  squareWidth: number = 0;
  squareHeight: number = 0;

  constructor(hSubdivisions: number, vSubdivisions: number) {
    super();
    this.hSubDiv = hSubdivisions;
    this.vSubDiv = vSubdivisions;
  }

  init(width: number, height: number) {
    this.width = width;
    this.height = height;
    const squareWidth = (this.squareWidth = width / this.hSubDiv);
    const squareHeight = (this.squareHeight = height / this.vSubDiv);
  }

  render(
    ctx: CanvasRenderingContext2D,
    color: string = "#fff",
    xOffset: number = 0,
    yOffset: number = 0
  ) {
    const { squareWidth, squareHeight, width, height } = this;
    ctx.strokeStyle = color;
    for (let y = yOffset; y < height; y += squareHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();
      ctx.closePath();
      for (let x = xOffset; x < width; x += squareWidth) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
        ctx.closePath();
      }
    }
    ctx.beginPath();
    ctx.moveTo(width - 1, 0);
    ctx.lineTo(width - 1, height);
    ctx.stroke();
    ctx.moveTo(0, height - 1);
    ctx.lineTo(width, height - 1);
    ctx.stroke();
    ctx.closePath();
  }

  onPlayerMovedToNextGridByCurrentVector = (player: Player) => {
    player.newCutPointAtCurrentPosition();
  };

  onPlayerChangedVector = (player: Player) => {
    player.newCutPointAtCurrentPosition();
  };
}
