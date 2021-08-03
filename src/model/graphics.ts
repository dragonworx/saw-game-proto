import { createElement } from './util';
import { Buffer } from './buffer';

export class Graphics {
  container: HTMLDivElement;
  width: number = 1;
  height: number = 1;
  buffers: Map<string, Buffer> = new Map();

  constructor() {
    this.container = createElement('div');
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.buffers.forEach((buffer) => buffer.setSize(width, height));
  }

  createBuffer(name: string) {
    const { width, height } = this;
    const buffer = new Buffer(width, height);
    this.buffers.set(name, buffer);
    buffer.canvas.setAttribute('data-buffer-name', name);
    this.container.appendChild(buffer.canvas);
    return buffer;
  }

  getBuffer(name: string) {
    return this.buffers.get(name)!;
  }

  getCanvas(bufferName: string) {
    return this.buffers.get(bufferName)!.canvas;
  }

  addBuffersToContainer(container: HTMLElement) {
    this.buffers.forEach((buffer) => container.appendChild(buffer.canvas));
  }
}
