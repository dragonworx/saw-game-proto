import { EventEmitter } from "eventemitter3";

export interface KeyEvent {
  key: string;
  code: string;
}

export class InputManager extends EventEmitter {
  keysDown: Map<string, KeyEvent>;
  accept: string[];

  constructor(accept?: string[]) {
    super();
    this.keysDown = new Map();
    this.accept = accept || [];
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    requestAnimationFrame(this.updateFrame);
  }

  accepts(code: string) {
    if (this.accept.length) {
      for (let i = 0; i < this.accept.length; i++) {
        if (this.accept[i] === code) {
          return true;
        }
      }
      return false;
    }
    return true;
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (!this.accepts(e.code)) {
      return;
    }
    const keyEvent = {
      key: e.key,
      code: e.code,
    };
    this.keysDown.set(e.code, keyEvent);
    this.emit("keydown", keyEvent);
  };

  onKeyUp = (e: KeyboardEvent) => {
    if (!this.accepts(e.code)) {
      return;
    }
    this.keysDown.delete(e.code);
    this.emit("keyup", {
      key: e.key,
      code: e.code,
    });
  };

  updateFrame = () => {
    this.keysDown.forEach((keyEvent) => {
      this.emit("keypress", keyEvent);
    });
    requestAnimationFrame(this.updateFrame);
  };

  isDown(code: string) {
    return this.keysDown.has(code);
  }
}
