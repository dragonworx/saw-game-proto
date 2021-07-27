export class Graphics {
  width: number = 0;
  height: number = 0;
  buffers: Map<string, Buffer> = new Map();

  constructor() {}

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  createBuffer(name: string) {
    const { width, height } = this;
    const buffer = new Buffer(width, height);
    this.buffers.set(name, buffer);
    return buffer;
  }

  getBuffer(name: string) {
    return this.buffers.get(name)!;
  }
}

export type RGBA = number[];

export class Buffer {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imageData: ImageData;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    const canvas = (this.canvas = document.createElement("canvas"));
    canvas.width = width;
    canvas.height = height;
    const ctx = (this.ctx = canvas.getContext("2d")!);
    this.imageData = ctx.getImageData(0, 0, width, height);
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

  setPixelAt(x: number, y: number, rgba: RGBA) {
    const { imageData } = this;
    const [r, g, b, a = 255] = rgba;
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

  drawHorizontalLine(x1: number, x2: number, y: number, color: RGBA) {
    const min = Math.min(x1, x2);
    const max = Math.max(x1, x2);
    for (let x = min; x <= max; x += 1) {
      this.setPixelAt(x, y, color);
    }
  }

  drawVerticalLine(y1: number, y2: number, x: number, color: RGBA) {
    const min = Math.min(y1, y2);
    const max = Math.max(y1, y2);
    for (let y = min; y <= max; y += 1) {
      this.setPixelAt(x, y, color);
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.getImageData();
  }
}
