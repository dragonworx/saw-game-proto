import { EventEmitter } from 'eventemitter3';

export type InputChannelType = string;

export class InputChannel<T> extends EventEmitter {
  name: string;
  filter: T[];
  bufferSize: number;
  buffer: T[] = [];
  bufferClearTimeoutMs: number;
  bufferClearTimeoutId: number = -1;
  activeInput: Map<T, number> = new Map();

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

  get hasFilteredInput() {
    return this.filter.length && this.activeInput.size > 0;
  }

  isInputActive(input: T) {
    return this.activeInput.has(input);
  }

  allowInput(input: T) {
    return this.filter.length
      ? !!this.filter.find((inputFilter) => input === inputFilter)
      : true;
  }

  activateInput(input: T) {
    this.activeInput.set(input, Date.now());
  }

  deactivateInput(input: T) {
    this.activeInput.delete(input);
  }

  getKeyPressDurationMs(input: T) {
    if (this.isInputActive(input)) {
      const now = Date.now();
      const startTime = this.activeInput.get(input) || now;
      return now - startTime;
    }
    return -1;
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
  onKeyDown(e: KeyboardEvent) {
    const { code } = e;
    this.activateInput(code);
    this.push(code);
    this.emit('keydown', code);
  }

  onKeyUp(e: KeyboardEvent) {
    const { code } = e;
    this.activeInput.delete(code);
    this.emit('keyup', code);
  }

  isKeyPressed(code: string) {
    return this.isInputActive(code);
  }

  update() {
    this.activeInput.forEach((_startTime, code) => this.emit('keypress', code));
  }
}
