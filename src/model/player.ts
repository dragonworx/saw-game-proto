import { EventEmitter } from "eventemitter3";
import { Grid } from "./grid";

export type SquareKey = "left" | "right" | "top" | "bottom";

export class Player extends EventEmitter {
  gridX: number = 0;
  gridY: number = 0;
  hPos: number = 0;
  vPos: number = 0;
  vectorX: number = 0;
  vectorY: number = 0;
  element: HTMLDivElement;
  nextMove: string = "";

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

  move(speed: number) {
    const { nextMove, vectorX, vectorY } = this;
    if (this.isVerticalMovement) {
      const vPos = this.vPos + speed;
      this.vPos = Math.min(1, vPos);
      if (vPos > 1) {
        this.moveGridPos();
        if (nextMove === "ArrowLeft") {
          this.setVector(-1, 0);
        } else if (nextMove === "ArrowRight") {
          this.setVector(1, 0);
        }
      }
    } else if (this.isHorizontalMovement) {
      const hPos = this.hPos + speed;
      this.hPos = Math.min(1, hPos);
      if (hPos > 1) {
        this.moveGridPos();
        if (nextMove === "ArrowUp") {
          this.setVector(0, -1);
        } else if (nextMove === "ArrowDown") {
          this.setVector(0, 1);
        }
      }
    }
  }

  setVector(x: number, y: number) {
    this.vectorX = x;
    this.vectorY = y;
  }

  moveGridPos(x: number = this.vectorX, y: number = this.vectorY) {
    this.gridX += x;
    this.gridY += y;
    this.hPos = this.vPos = 0;
  }

  moveToPositionOnGrid(grid: Grid) {
    const { hPos, vPos, vectorX, vectorY, gridX, gridY, element } = this;
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
  }
}
