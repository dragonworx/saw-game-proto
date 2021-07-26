import { EventEmitter } from "eventemitter3";
import { InputManager, KeyEvent } from "../inputManager";
import { throttled } from "../util";
import { Player } from "./player";
import { Grid } from "./grid";
import { perlin_noise } from "../util";

export const GridSubDivisions = 10;
export const PlayerSpeed = 0.02;

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
    graphics.fgCtx.translate(0.5, 0.5);
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
    this.setPlayersInitialPositions();
  }

  distributePlayerInitialPositions() {
    this.setPlayerInitialPosition(
      this.userPlayer,
      this.grid.hSubDiv,
      this.grid.vSubDiv / 2,
      -1,
      0
    );
  }

  setPlayerInitialPosition(
    player: Player,
    gridXIndex: number,
    gridYIndex: number,
    vectorX: number,
    vectorY: number
  ) {
    player.gridXIndex = gridXIndex;
    player.gridYIndex = gridYIndex;
    player.setVector(vectorX, vectorY);
    player
      .on(
        "moveToNextGridByVector",
        this.grid.onPlayerMovedToNextGridByCurrentVector
      )
      .on("changeVector", (player) => {
        // player.move(PlayerSpeed);
        // player.setToCurrentPosition(this.grid);
        this.grid.onPlayerChangedVector(player);
      });
  }

  addPlayerElementsToSprites() {
    const { sprites } = this.graphics;
    this.players.forEach((player) => {
      sprites.appendChild(player.element);
    });
  }

  setPlayersInitialPositions() {
    this.players.forEach((player) => {
      player.setToCurrentPosition(this.grid);
      player.clearCutPoints();
      player.newCutPointAtCurrentPosition();
    });
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
      player.setToCurrentPosition(this.grid);

      const { fgCtx: ctx } = this.graphics;
      const { lastPosX, lastPosY, currentPosX, currentPosY, vectorX, vectorY } =
        player;
      const deltaX = Math.abs(lastPosX - currentPosX);
      const deltaY = Math.abs(lastPosY - currentPosY);
      if (
        (player.isHorizontalMovement && deltaX === 0) ||
        (player.isVerticalMovement && deltaY === 0)
      ) {
        console.log("no delta");
      } else {
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(lastPosX, lastPosY);
        ctx.lineTo(currentPosX, currentPosY);
        ctx.closePath();
        ctx.stroke();
      }

      this.checkForCutIntersection(player);
    });
  }

  checkForCutIntersection(player: Player) {
    const { fgCtx: ctx } = this.graphics;
    const { currentPosX, currentPosY } = player;
    const p = ctx.getImageData(currentPosX, currentPosY, 1, 1).data;
    if (p[0] === 255) {
      console.log("intersection");
      this.closeCut(player);
    }
  }

  closeCut(player: Player) {
    const { fgCtx: ctx } = this.graphics;
    const { cutPoints } = player;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(cutPoints[0].x, cutPoints[0].y);
    for (let i = 1; i < cutPoints.length; i++) {
      ctx.lineTo(cutPoints[i].x, cutPoints[i].y);
    }
    ctx.closePath();
    ctx.fill();
    player.clearCutPoints();
    player.newCutPointAtCurrentPosition();
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

  renderFg() {
    // const { fgCtx: ctx, bgCtx } = this.graphics;
    // this.players.forEach((player) => {
    //   const { lastPosX, lastPosY, currentPosX, currentPosY, vectorX, vectorY } =
    //     player;
    //   ctx.strokeStyle = "red";
    //   ctx.lineWidth = 5;
    //   ctx.beginPath();
    //   ctx.moveTo(lastPosX, lastPosY);
    //   ctx.lineTo(currentPosX - vectorX, currentPosY - vectorY);
    //   ctx.stroke();
    //   ctx.closePath();
    //   player.cutPoints.forEach((point) => {
    //     ctx.strokeStyle = "yellow";
    //     bgCtx.beginPath();
    //     bgCtx.arc(point.x, point.y, 6, 0, 6.28319);
    //     bgCtx.stroke();
    //     bgCtx.closePath();
    //   });
    // });
  }
}
