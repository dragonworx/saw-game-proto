import { EventEmitter } from 'eventemitter3';

export type InputChannelBuffer = string[];

export interface InputChannelEvent {
  code: string;
  buffer: string[];
  channel: InputChannel;
}

export class InputChannel extends EventEmitter {
  name: string;
  keysDown: Map<string, number> = new Map();
  accept: string[];
  bufferSize: number;
  buffer: InputChannelBuffer = [];
  bufferClearTimeoutMs: number;
  bufferClearTimeoutId: number = -1;

  constructor(
    name: string,
    accepts: string[],
    bufferSize?: number,
    bufferClearTimeoutMs?: number
  ) {
    super();
    this.name = name;
    this.accept = accepts || [];
    this.bufferSize = bufferSize || 1;
    this.bufferClearTimeoutMs = bufferClearTimeoutMs || 3000;
  }

  accepts(code: string) {
    return this.accept.length
      ? !!this.accept.find((keyCode) => code === keyCode)
      : true;
  }

  push(code: string) {
    const { buffer, bufferSize } = this;
    buffer.push(code);
    if (buffer.length > bufferSize) {
      buffer.shift();
    }
    if (this.bufferClearTimeoutId > -1) {
      window.clearTimeout(this.bufferClearTimeoutId);
    }
    this.bufferClearTimeoutId = window.setTimeout(
      this.clearBuffer,
      this.bufferClearTimeoutMs
    );
  }

  clearBuffer = () => {
    this.buffer.length = 0;
    this.bufferClearTimeoutId = -1;
  };

  peek(): string | undefined {
    return this.buffer[this.buffer.length - 1];
  }

  pop() {
    return this.buffer.pop();
  }

  onKeyDown(e: KeyboardEvent) {
    this.keysDown.set(e.code, Date.now());
    this.push(e.code);
    this.emit('keydown', {
      code: e.code,
      buffer: this.buffer,
      channel: this,
    } as InputChannelEvent);
  }

  onKeyUp(e: KeyboardEvent) {
    this.keysDown.delete(e.code);
    this.emit('keyup', {
      code: e.code,
      buffer: this.buffer,
      channel: this,
    } as InputChannelEvent);
  }

  isKeyPressed(code: string) {
    return this.keysDown.has(code);
  }

  getKeyPressDurationMs(code: string) {
    const now = Date.now();
    const startTime = this.keysDown.get(code) || now;
    return now - startTime;
  }

  update() {
    this.keysDown.forEach((_startTime, code) =>
      this.emit('keypress', {
        code,
        buffer: this.buffer,
        channel: this,
      } as InputChannelEvent)
    );
  }
}