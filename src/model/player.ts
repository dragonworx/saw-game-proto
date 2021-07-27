import { EventEmitter } from "eventemitter3";
import { Grid } from "./grid";
import { Buffer } from "./graphics";

export type SquareKey = "left" | "right" | "top" | "bottom";

export interface Point {
  x: number;
  y: number;
}

export class Player extends EventEmitter {
  gridXIndex: number = 0;
  gridYIndex: number = 0;
  hPos: number = 0;
  vPos: number = 0;
  vectorX: number = 0;
  vectorY: number = 0;
  sprite: HTMLDivElement;
  nextMove: string = "";
  currentPosX: number = -1;
  currentPosY: number = -1;
  lastPosX: number = -1;
  lastPosY: number = -1;
  cutPoints: Point[] = [];

  constructor() {
    super();
    const sprite = (this.sprite = document.createElement("div"));
    sprite.classList.add("sprite", "player");
  }

  setNextMove(keyCode: string) {
    this.nextMove = keyCode;
  }

  clearInput() {
    this.nextMove = "";
  }

  get isVerticalMovement() {
    return this.vectorY !== 0;
  }

  get isHorizontalMovement() {
    return this.vectorX !== 0;
  }

  get hasInput() {
    return this.nextMove !== "";
  }

  get isMovingLeft() {
    return this.vectorX === -1;
  }

  get isMovingRight() {
    return this.vectorX === 1;
  }

  get isMovingUp() {
    return this.vectorY === -1;
  }

  get isMovingDown() {
    return this.vectorY === 1;
  }

  get isOnGridVertex() {
    return (
      (this.isVerticalMovement && this.vPos === 0) ||
      (this.isHorizontalMovement && this.hPos === 0)
    );
  }

  setInitialPosition(
    gridXIndex: number,
    gridYIndex: number,
    vectorX: number,
    vectorY: number,
    grid: Grid
  ) {
    this.hPos = 0;
    this.vPos = 0;
    this.gridXIndex = gridXIndex;
    this.gridYIndex = gridYIndex;
    this.vectorX = vectorX;
    this.vectorY = vectorY;
    const [x, y] = grid.getPosition(this);
    this.lastPosX = this.currentPosX = x;
    this.lastPosY = this.currentPosY = y;
  }

  markLastPos() {
    this.lastPosX = this.currentPosX;
    this.lastPosY = this.currentPosY;
  }

  move(speed: number, grid: Grid) {
    const { squareWidth, squareHeight } = grid;
    const { nextMove } = this;
    if (this.isVerticalMovement) {
      const vPos = this.vPos + speed;
      this.vPos = Math.min(squareHeight, vPos);
      if (vPos > squareHeight) {
        this.moveToNextGridIndexByVector();
        if (this.hasInput) {
          if (nextMove === "ArrowLeft") {
            this.setVector(-1, 0);
            this.emit("changeVector", this);
          } else if (nextMove === "ArrowRight") {
            this.setVector(1, 0);
            this.emit("changeVector", this);
          }
          this.clearInput();
        } else {
          this.emit("moveToNextGridByVector", this);
        }
      }
    } else if (this.isHorizontalMovement) {
      const hPos = this.hPos + speed;
      this.hPos = Math.min(squareWidth, hPos);
      if (hPos > squareWidth) {
        this.moveToNextGridIndexByVector();
        if (this.hasInput) {
          if (nextMove === "ArrowUp") {
            this.setVector(0, -1);
            this.emit("changeVector", this);
          } else if (nextMove === "ArrowDown") {
            this.setVector(0, 1);
            this.emit("changeVector", this);
          }
          this.clearInput();
        } else {
          this.emit("moveToNextGridByVector", this);
        }
      }
    }
  }

  moveToNextGridIndexByVector() {
    this.gridXIndex += this.vectorX;
    this.gridYIndex += this.vectorY;
    this.hPos = this.vPos = 0;
  }

  setVector(x: number, y: number) {
    this.vectorX = x;
    this.vectorY = y;
  }

  setSpriteToCurrentPosition(grid: Grid) {
    const { sprite } = this;
    const [x, y] = grid.getPosition(this);
    sprite.style.left = `${x}px`;
    sprite.style.top = `${y}px`;
    this.currentPosX = x;
    this.currentPosY = y;
  }

  clearCutPoints() {
    this.cutPoints = [];
  }

  newCutPointAtCurrentPosition() {
    const { currentPosX, currentPosY } = this;
    this.cutPoints.push({ x: currentPosX, y: currentPosY });
  }

  renderCurrentCutLine(buffer: Buffer) {
    const { lastPosX, lastPosY, currentPosX, currentPosY, vectorX, vectorY } =
      this;
    const red = [255, 0, 0];
    if (this.isHorizontalMovement) {
      buffer.drawHorizontalLine(
        lastPosX,
        currentPosX - vectorX,
        currentPosY,
        red
      );
    } else {
      buffer.drawVerticalLine(
        lastPosY,
        currentPosY - vectorY,
        currentPosX,
        red
      );
    }
    buffer.updateImageData();
  }

  renderCutPoints(buffer: Buffer) {
    const { ctx } = buffer;
    this.cutPoints.forEach((point) => {
      ctx.strokeStyle = "yellow";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 6.28319);
      ctx.closePath();
      ctx.stroke();
    });
  }
}
