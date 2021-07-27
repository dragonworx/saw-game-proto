import { EventEmitter } from "eventemitter3";
import { Player } from "./player";
import { Buffer } from "./graphics";

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
    this.squareWidth = width / this.hSubDiv;
    this.squareHeight = height / this.vSubDiv;
  }

  getPosition(player: Player) {
    const { squareWidth, squareHeight } = this;
    const { hPos, vPos, gridXIndex, gridYIndex } = player;
    let x = gridXIndex * squareWidth;
    let y = gridYIndex * squareHeight;
    const xt = squareWidth * hPos;
    const yt = squareHeight * vPos;
    if (player.isMovingLeft) {
      x -= xt;
    } else if (player.isMovingRight) {
      x += xt;
    } else if (player.isMovingUp) {
      y -= yt;
    } else if (player.isMovingDown) {
      y += yt;
    }
    return [x, y];
  }

  render(buffer: Buffer) {
    const { squareWidth, squareHeight, width, height } = this;
    const color = { r: 255, g: 255, b: 255 };
    buffer.getImageData();
    for (let y = 0; y <= height; y += squareHeight) {
      buffer.drawHorizontalLine(0, width, y, color);
      for (let x = 0; x <= width; x += squareWidth) {
        buffer.drawVerticalLine(0, height, x, color);
      }
    }
    buffer.drawHorizontalLine(0, width, height - 1, color);
    buffer.drawVerticalLine(0, height, width - 1, color);
    buffer.updateImageData();
  }

  onPlayerMovedToNextGridByCurrentVector = (player: Player) => {
    player.newCutPointAtCurrentPosition();
  };

  onPlayerChangedVector = (player: Player) => {
    player.newCutPointAtCurrentPosition();
  };
}
