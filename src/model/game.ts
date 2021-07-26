import { EventEmitter } from "eventemitter3";
import { InputManager, KeyEvent } from "../inputManager";
import { throttled } from "../util";
import { Player } from "./player";
import { Grid } from "./grid";
import { perlin_noise } from "../util";

export const GridSubDivisions = 10;
export const PlayerSpeed = 0.01;

export type Graphics = {
  fgCanvas: HTMLCanvasElement;
  bgCanvas: HTMLCanvasElement;
  fgCtx: CanvasRenderingContext2D;
  bgCtx: CanvasRenderingContext2D;
  sprites: HTMLDivElement;
};

export type Size = {
  width: number;
  height: number;
};

export const AcceptPlayerInput = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
];

export class Game extends EventEmitter {
  static instance: Game = new Game();

  players: Player[] = [];
  userPlayer: Player;
  grid: Grid;

  inputManager: InputManager;
  graphics: Graphics = {
    fgCanvas: {} as HTMLCanvasElement,
    bgCanvas: {} as HTMLCanvasElement,
    fgCtx: {} as CanvasRenderingContext2D,
    bgCtx: {} as CanvasRenderingContext2D,
    sprites: {} as HTMLDivElement,
  };
  size: Size = { width: 0, height: 0 };
  lastTime: number = -1;
  isRunning: boolean = true;

  constructor() {
    super();
    this.inputManager = new InputManager([...AcceptPlayerInput, "Space"]);
    this.grid = new Grid(GridSubDivisions, GridSubDivisions);
    this.inputManager.on("keydown", throttled(this.onKeyDown, 1000 / 60));
    const userPlayer = (this.userPlayer = new Player());
    this.addPlayer(userPlayer);
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  init(size: Size, graphics: Graphics) {
    this.size = size;
    this.graphics = graphics;
    this.grid.init(size.width, size.height);
    this.renderBg();
    this.start();
  }

  start() {
    this.reset();
    this.startAnimation();
  }

  startAnimation() {
    requestAnimationFrame(this.updateFrame);
  }

  reset() {
    this.distributePlayerInitialPositions();
    this.addPlayerElementsToSprites();
    this.setPlayerInitialPositions();
  }

  distributePlayerInitialPositions() {
    const player = this.userPlayer;
    player.gridX = this.grid.hSubDiv / 2;
    player.setVector(0, 1);
  }

  addPlayerElementsToSprites() {
    const { sprites } = this.graphics;
    this.players.forEach((player) => {
      sprites.appendChild(player.element);
    });
  }

  setPlayerInitialPositions() {
    this.players.forEach((player) => player.moveToPositionOnGrid(this.grid));
  }

  onKeyDown = (e: KeyEvent) => {
    if (AcceptPlayerInput.includes(e.code)) {
      this.userPlayer.setNextMove(e.code);
    } else {
      switch (e.code) {
        case "Space":
          this.isRunning = !this.isRunning;
          if (this.isRunning) {
            this.startAnimation();
          }
          break;
      }
    }
  };

  updateFrame = (currentTime: number) => {
    if (this.lastTime === -1) {
      this.lastTime === currentTime;
    }
    const deltaTime = currentTime - this.lastTime;
    const fps = Math.round(1000 / deltaTime);
    this.emit("fps", fps);
    this.update();
    this.renderFg();
    this.lastTime = currentTime;
    if (this.isRunning) {
      requestAnimationFrame(this.updateFrame);
    }
  };

  update() {
    this.players.forEach((player) => {
      player.move(PlayerSpeed);
      player.moveToPositionOnGrid(this.grid);
    });
  }

  renderBg() {
    const { bgCtx: ctx, bgCanvas } = this.graphics;
    perlin_noise(bgCanvas);
    ctx.fillStyle = "darkGreen";
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 0, this.size.width, this.size.height);
    ctx.globalAlpha = 1;
    this.grid.render(ctx);
  }

  renderFg() {}
}
