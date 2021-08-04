import { Color, Point, Rect } from './util';

export class Buffer {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imageData: ImageData;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    const canvas = (this.canvas = document.createElement('canvas'));
    canvas.width = width;
    canvas.height = height;
    const ctx = (this.ctx = canvas.getContext('2d')!);
    ctx.translate(0.5, 0.5);
    this.imageData = ctx.getImageData(0, 0, width, height);
  }

  setSize(width: number, height: number) {
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    this.getImageData();
  }

  getPixelAt(x: number, y: number) {
    const { imageData } = this;
    const redIndex = y * (this.width * 4) + x * 4;
    const red = imageData.data[redIndex];
    const green = imageData.data[redIndex + 1];
    const blue = imageData.data[redIndex + 2];
    const alpha = imageData.data[redIndex + 3];
    return [red, green, blue, alpha];
  }

  setPixelAt(x: number, y: number, color: Color) {
    const { imageData } = this;
    const [r, g, b, a = 255] = color;
    const redIndex = y * (this.width * 4) + x * 4;
    imageData.data[redIndex] = r;
    imageData.data[redIndex + 1] = g;
    imageData.data[redIndex + 2] = b;
    imageData.data[redIndex + 3] = a;
  }

  getImageData() {
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
  }

  updateImageData() {
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  batchImageDataOps(fn: () => void) {
    this.getImageData();
    fn();
    this.updateImageData();
  }

  drawHorizontalLine(x1: number, x2: number, y: number, color: Color) {
    const min = Math.min(x1, x2);
    const max = Math.max(x1, x2);
    for (let x = min; x <= max; x += 1) {
      this.setPixelAt(x, y, color);
    }
  }

  drawVerticalLine(y1: number, y2: number, x: number, color: Color) {
    const min = Math.min(y1, y2);
    const max = Math.max(y1, y2);
    for (let y = min; y <= max; y += 1) {
      this.setPixelAt(x, y, color);
    }
  }

  drawStraightLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: Color
  ) {
    if (y1 === y2) {
      this.drawHorizontalLine(x1, x2, y1, color);
    } else {
      this.drawVerticalLine(y1, y2, x1, color);
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.getImageData();
  }

  drawPoint(
    x: number,
    y: number,
    color: string = 'yellow',
    radius: number = 6
  ) {
    const { ctx } = this;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 6.28319);
    ctx.closePath();
    ctx.stroke();
  }

  fillRect(x: number, y: number, width: number, height: number, color: string) {
    const { ctx } = this;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.closePath();
    ctx.fill();
  }

  fillBounds(bounds: Rect, color: string) {
    const [x, y, w, h] = bounds;
    this.fillRect(x, y, w, h, color);
  }

  fill(color: string) {
    this.fillRect(0, 0, this.width, this.height, color);
  }

  strokeRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) {
    const { ctx } = this;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.closePath();
    ctx.stroke();
  }

  fillPolygon(points: Point[], color: string) {
    const { ctx } = this;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    this.getImageData();
  }
}
