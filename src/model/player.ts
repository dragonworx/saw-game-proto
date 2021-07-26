import { EventEmitter } from "eventemitter3";
import { Grid } from "./grid";

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
  element: HTMLDivElement;
  nextMove: string = "";
  currentPosX: number = -1;
  currentPosY: number = -1;
  lastPosX: number = -1;
  lastPosY: number = -1;
  cutPoints: Point[] = [];

  constructor() {
    super();
    const element = (this.element = document.createElement("div"));
    element.classList.add("sprite", "player");
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

  setToCurrentPosition(grid: Grid) {
    const { hPos, vPos, gridXIndex: gridX, gridYIndex: gridY, element } = this;
    const { squareWidth, squareHeight } = grid;
    let x = gridX * squareWidth;
    let y = gridY * squareHeight;
    const xt = squareWidth * hPos;
    const yt = squareHeight * vPos;
    if (this.isMovingLeft) {
      x -= xt;
    } else if (this.isMovingRight) {
      x += xt;
    } else if (this.isMovingUp) {
      y -= yt;
    } else if (this.isMovingDown) {
      y += yt;
    }
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    if (this.currentPosX === -1 && this.currentPosY === -1) {
      this.lastPosX = x;
      this.lastPosY = y;
    } else {
      this.lastPosX = this.currentPosX;
      this.lastPosY = this.currentPosY;
    }
    this.currentPosX = x;
    this.currentPosY = y;
  }

  move(speed: number) {
    const { nextMove, vectorX, vectorY } = this;
    if (this.isVerticalMovement) {
      const vPos = this.vPos + speed;
      this.vPos = Math.min(1, vPos);
      if (vPos > 1) {
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
      this.hPos = Math.min(1, hPos);
      if (hPos > 1) {
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

  clearCutPoints() {
    this.cutPoints = [];
  }

  newCutPointAtCurrentPosition() {
    const { currentPosX, currentPosY } = this;
    this.cutPoints.push({ x: currentPosX, y: currentPosY });
  }
}
