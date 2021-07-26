import { EventEmitter } from "eventemitter3";
import { Segment } from "./segment";
import { Player } from "./player";

export class Grid extends EventEmitter {
  hSubDiv: number;
  vSubDiv: number;
  width: number = 0;
  height: number = 0;
  squareWidth: number = 0;
  squareHeight: number = 0;
  horizontalSegments: Segment[] = [];
  verticalSegments: Segment[] = [];

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
    for (let x = 0; x <= width; x += squareWidth) {
      const segment = new Segment("vertical");
      this.verticalSegments.push(segment);
    }
    for (let y = 0; y <= height; y += squareHeight) {
      const segment = new Segment("horizontal");
      this.horizontalSegments.push(segment);
    }
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

  renderCuts(ctx: CanvasRenderingContext2D, color: string = "red") {
    const { squareWidth, squareHeight, horizontalSegments, verticalSegments } =
      this;
    ctx.strokeStyle = color;
    verticalSegments.forEach((segment, i) => {
      segment.cuts.forEach((cutInfo, gridIndex) => {
        const { length, color } = cutInfo;
        const x = i * squareWidth;
        const y = gridIndex * squareHeight;
        const height = length * squareHeight;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.stroke();
        ctx.closePath();
      });
    });
    horizontalSegments.forEach((segment, i) => {
      segment.cuts.forEach((cutInfo, gridIndex) => {
        const { length, color } = cutInfo;
        const y = i * squareHeight;
        const x = gridIndex * squareWidth;
        const width = length * squareWidth;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.stroke();
        ctx.closePath();
      });
    });
  }

  beginCut(player: Player) {
    const { gridXIndex, gridYIndex } = player;
    if (player.isVerticalMovement) {
      const segment = (player.segment = this.verticalSegments[gridXIndex]);
      segment.beginCut(gridYIndex, player.vectorY);
    } else {
      const segment = (player.segment = this.horizontalSegments[gridYIndex]);
      segment.beginCut(gridXIndex, player.vectorX);
    }
  }

  onPlayerMovedToNextGridByCurrentVector = (player: Player) => {
    this.beginCut(player);
  };

  onPlayerChangedVector = (player: Player) => {
    this.beginCut(player);
  };
}
