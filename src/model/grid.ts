import { GridSquare } from "./gridSquare";
import { Player, Vector } from "./player";

export class Grid {
  rows: Array<GridSquare[]> = [];
  hSubDiv: number;
  vSubDiv: number;
  width: number = 0;
  height: number = 0;
  squareWidth: number = 0;
  squareHeight: number = 0;

  constructor(hSubdivisions: number, vSubdivisions: number) {
    this.hSubDiv = hSubdivisions;
    this.vSubDiv = vSubdivisions;
  }

  init(width: number, height: number) {
    this.width = width;
    this.height = height;
    const squareWidth = (this.squareWidth = width / this.hSubDiv);
    const squareHeight = (this.squareHeight = height / this.vSubDiv);
    let x: number = 0;
    let y: number = 0;
    for (let v = 0; v < this.vSubDiv; v += 1) {
      const row: GridSquare[] = [];
      let prev: GridSquare | undefined;
      x = 0;
      for (let h = 0; h < this.hSubDiv; h += 1) {
        const square = new GridSquare(`${h}:${v}@${x}x${y}`, x, y);
        row.push(square);
        if (prev) {
          square.left = prev;
          prev.right = square;
        }
        if (v > 0) {
          const above = this.rows[v - 1][h];
          square.top = above;
          above.bottom = square;
        }
        x += squareWidth;
        prev = square;
      }
      this.rows.push(row);
      y += squareHeight;
    }
  }

  getSquareBounds(square: GridSquare) {
    const { x, y } = square;
    return {
      left: x,
      top: y,
      right: x + this.squareWidth,
      bottom: y + this.squareHeight,
      width: this.squareWidth,
      height: this.squareHeight,
    };
  }

  getPosition(player: Player): Vector {
    const { hPos, vPos, square } = player;
    let { x, y } = square;
    x = x + this.squareWidth * hPos;
    y = y + this.squareHeight * vPos;
    return { x, y };
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, 100, 100);
    ctx.strokeStyle = "#fff";
    for (let y = 0; y < this.height; y += this.squareHeight) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
      for (let x = 0; x < this.width; x += this.squareWidth) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.height);
        ctx.stroke();
      }
    }
    ctx.moveTo(this.width - 1, 0);
    ctx.lineTo(this.width - 1, this.height);
    ctx.stroke();
    ctx.moveTo(0, this.height - 1);
    ctx.lineTo(this.width, this.height - 1);
    ctx.stroke();
  }
}
