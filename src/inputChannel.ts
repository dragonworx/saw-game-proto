import { EventEmitter } from 'eventemitter3';

export type InputChannelType = string;

export class InputChannel<T> extends EventEmitter {
  name: string;
  filter: T[];
  bufferSize: number;
  buffer: T[] = [];
  bufferClearTimeoutMs: number;
  bufferClearTimeoutId: number = -1;

  constructor(
    name: string,
    filter: T[] = [],
    bufferSize: number = 1,
    bufferClearTimeoutMs: number = 3000
  ) {
    super();
    this.name = name;
    this.filter = filter;
    this.bufferSize = bufferSize;
    this.bufferClearTimeoutMs = bufferClearTimeoutMs;
  }

  allowInput(input: T) {
    return this.filter.length
      ? !!this.filter.find((inputFilter) => input === inputFilter)
      : true;
  }

  push(code: T) {
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

  peek(): T | undefined {
    return this.buffer[this.buffer.length - 1];
  }

  pop() {
    return this.buffer.pop();
  }

  update() {}
}

export class KeyboardInputChannel extends InputChannel<string> {
  keysDown: Map<string, number> = new Map();

  onKeyDown(e: KeyboardEvent) {
    this.keysDown.set(e.code, Date.now());
    this.push(e.code);
    this.emit('keydown', e.code);
  }

  onKeyUp(e: KeyboardEvent) {
    this.keysDown.delete(e.code);
    this.emit('keyup', e.code);
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
    this.keysDown.forEach((_startTime, code) => this.emit('keypress', code));
  }
}
