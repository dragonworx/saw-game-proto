import { EventEmitter } from "eventemitter3";
import Polygon from "polygon";
import { InputManager, KeyEvent } from "../inputManager";
import { throttled } from "../util";
import { Player } from "./player";
import { Grid } from "./grid";
import { Graphics } from "./graphics";
import { perlin_noise } from "../util";

export const GridSubDivisions = 10;
export const PlayerSpeed = 1;

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
  graphics: Graphics;
  spritesContainer?: HTMLDivElement;
  width: number = 0;
  height: number = 0;
  lastTime: number = -1;
  isRunning: boolean = true;

  constructor() {
    super();
    this.inputManager = new InputManager([
      ...AcceptPlayerInput,
      "Space",
      "Enter",
    ]);
    this.grid = new Grid(GridSubDivisions, GridSubDivisions);
    this.inputManager.on("keydown", throttled(this.onKeyDown, 1000 / 60));
    this.graphics = new Graphics();
    const userPlayer = (this.userPlayer = new Player());
    this.addPlayer(userPlayer);
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  initGraphics(
    width: number,
    height: number,
    graphicsContainer: HTMLDivElement
  ) {
    const { graphics, grid } = this;
    grid.init(width, height);
    graphics.setSize(width, height);
    const { canvas: gridCanvas } = graphics.createBuffer("grid");
    const { canvas: cutsCanvas } = graphics.createBuffer("cuts");
    graphicsContainer.appendChild(gridCanvas);
    graphicsContainer.appendChild(cutsCanvas);
    this.renderBg();
  }

  setSpritesContainer(element: HTMLDivElement) {
    this.spritesContainer = element;
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
    const { grid } = this;
    player.gridXIndex = gridXIndex;
    player.gridYIndex = gridYIndex;
    player.setVector(vectorX, vectorY);
    player.setInitialPosition(gridXIndex, gridYIndex, vectorX, vectorY, grid);
    player
      .on("moveToNextGridByVector", grid.onPlayerMovedToNextGridByCurrentVector)
      .on("changeVector", grid.onPlayerChangedVector);
  }

  addPlayerElementsToSprites() {
    const { spritesContainer } = this;
    if (spritesContainer) {
      this.players.forEach((player) => {
        spritesContainer.appendChild(player.sprite);
      });
    }
  }

  setPlayersInitialPositions() {
    this.players.forEach((player) => {
      player.setSpriteToCurrentPosition(this.grid);
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
        case "Enter":
          this.updateFrame(0);
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
    this.updatePlayers();
    this.lastTime = currentTime;
    if (this.isRunning) {
      requestAnimationFrame(this.updateFrame);
    }
  };

  updatePlayers() {
    const { grid } = this;
    this.players.forEach((player) => {
      player.markLastPos();
      player.move(PlayerSpeed, grid);
      player.setSpriteToCurrentPosition(grid);
      this.checkForCutIntersection(player);
      player.renderCurrentCutLine(this.graphics.getBuffer("cuts"));
    });
  }

  checkForCutIntersection(player: Player) {
    const buffer = this.graphics.getBuffer("cuts");
    const { currentPosX, currentPosY } = player;
    const p = buffer.getPixelAt(currentPosX, currentPosY);
    if (p[0] === 255) {
      console.log("intersection");
      this.closeCut(player);
    }
  }

  closeCut(player: Player) {
    const { ctx } = this.graphics.getBuffer("grid");
    // const { cutPoints } = player;
    player.newCutPointAtCurrentPosition();

    const polygon = new Polygon(player.cutPoints);
    // const intersections = polygon.selfIntersections();
    // console.log(polygon);
    // intersections.forEach((polygon) => {
    const cutPoints = polygon.toArray();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(cutPoints[0][0], cutPoints[0][1]);
    for (let i = 1; i < cutPoints.length; i++) {
      ctx.lineTo(cutPoints[i][0], cutPoints[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    // });

    player.clearCutPoints();
    player.newCutPointAtCurrentPosition();
  }

  renderBg() {
    const buffer = this.graphics.getBuffer("grid");
    const { ctx, canvas } = buffer;
    perlin_noise(canvas);
    ctx.fillStyle = "darkGreen";
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalAlpha = 1;
    this.grid.render(buffer);
  }
}
