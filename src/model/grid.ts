export class Grid {
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
    this.squareWidth = width / this.hSubDiv;
    this.squareHeight = height / this.vSubDiv;
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
