import { EventEmitter } from 'eventemitter3';
import { interval, Timer } from 'd3-timer';

export class Animator extends EventEmitter {
  isRunning: boolean = false;
  fps: number;
  fpsInterval: number;
  timer: Timer;
  lastTime: number = -1;

  constructor(fps: number = 60) {
    super();
    this.fps = fps;
    this.fpsInterval = 1000 / fps;
    this.timer = interval(this.onFrame, this.fpsInterval);
  }

  setFps(fps: number) {
    this.fps = fps;
    this.fpsInterval = 1000 / fps;
    this.timer.stop();
    this.timer = interval(this.onFrame, this.fpsInterval);
  }

  start() {
    this.isRunning = true;
  }

  stop() {
    this.isRunning = false;
  }

  toggleRunning() {
    this.isRunning = !this.isRunning;
  }

  onFrame = (elapsed: number) => {
    if (this.isRunning) {
      if (this.lastTime > -1) {
        this.emit('frame', this.fps, elapsed);
      } else {
        const delta = elapsed - this.lastTime;
        const fps = 1000 / delta;
        this.emit('frame', fps, elapsed);
      }
    }
    this.lastTime = elapsed;
  };
}
