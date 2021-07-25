import { EventEmitter } from "eventemitter3";
import { GridSquare } from "./gridSquare";

export type SquareKey = "left" | "right" | "top" | "bottom";

export type Vector = {
  x: number;
  y: number;
};

export class Player extends EventEmitter {
  square: GridSquare = {} as GridSquare;
  hPos: number = 0;
  vPos: number = 0;
  vector: Vector = { x: 0, y: 0 };
  element: HTMLDivElement;
  nextMove: string = "";

  constructor() {
    super();
    const element = (this.element = document.createElement("div"));
    element.classList.add("sprite", "player");
  }

  get isVerticalDirection() {
    return this.vector.y !== 0;
  }

  get isHorizontallDirection() {
    return this.vector.x !== 0;
  }

  get hasInput() {
    return this.nextMove !== "";
  }

  get isNextMoveLeft() {
    return this.nextMove === "ArrowLeft";
  }

  get isNextMoveRight() {
    return this.nextMove === "ArrowRight";
  }

  get isNextMoveUp() {
    return this.nextMove === "ArrowUp";
  }

  get isNextMoveDown() {
    return this.nextMove === "ArrowDown";
  }

  get hasHitLeft() {
    return this.hPos === 0 && this.vector.x === -1;
  }

  get hasHitRight() {
    return this.hPos === 1 && this.vector.x === 1;
  }

  get hasHitTop() {
    return this.vPos === 0 && this.vector.y === -1;
  }

  get hasHitBottom() {
    return this.vPos === 1 && this.vector.y === 1;
  }

  get isHMin() {
    return this.hPos === 0;
  }

  get isHMax() {
    return this.hPos === 1;
  }

  get isVMin() {
    return this.vPos === 0;
  }

  get isVMax() {
    return this.vPos === 1;
  }

  setNextMove(keyCode: string) {
    this.nextMove = keyCode;
  }

  move(speed: number) {
    const { vector, square, nextMove } = this;
    let { hPos, vPos } = this;
    if (this.isVerticalDirection) {
      if (vector.y === -1) {
        vPos = Math.max(0, vPos - speed);
      } else if (vector.y === 1) {
        vPos = Math.min(1, vPos + speed);
      }
      this.vPos = vPos;
    } else if (this.isHorizontallDirection) {
      if (vector.x === -1) {
        hPos = Math.max(0, hPos - speed);
      } else if (vector.x === 1) {
        hPos = Math.min(1, hPos + speed);
      }
      this.hPos = hPos;
    }
  }

  turn() {
    const { hPos, vPos, hasInput } = this;
    if (this.hasHitLeft) {
      if (hasInput) {
        if (this.isVMin) {
          if (this.isNextMoveUp) {
            this.changeSquare("top", 0, 1, 0, -1);
          } else if (this.isNextMoveDown) {
            this.setVector(0, 1);
          }
        } else if (this.isVMax) {
          if (this.isNextMoveUp) {
            this.setVector(0, -1);
          } else if (this.isNextMoveDown) {
            this.changeSquare("bottom", 0, 0, 0, 1);
          }
        }
        this.clearInput();
      } else {
        this.changeSquare("left", 1);
      }
    } else if (this.hasHitRight) {
      if (hasInput) {
        if (this.isVMin) {
          if (this.isNextMoveUp) {
            this.changeSquare("top", hPos, 1, 0, -1);
          } else if (this.isNextMoveDown) {
            this.setVector(0, 1);
          }
        } else if (this.isVMax) {
          if (this.isNextMoveUp) {
            this.setVector(0, -1);
          } else if (this.isNextMoveDown) {
            this.changeSquare("bottom", hPos, 0, 0, 1);
          }
        }
        this.clearInput();
      } else {
        this.changeSquare("right", 0, vPos);
      }
    } else if (this.hasHitTop) {
      if (hasInput) {
        if (this.isHMin) {
          if (this.isNextMoveLeft) {
            this.changeSquare("left", 1, vPos, -1, 0);
          } else if (this.isNextMoveRight) {
            this.setVector(1, 0);
          }
        } else if (this.isHMax) {
          if (this.isNextMoveLeft) {
            this.setVector(-1, 0);
          } else if (this.isNextMoveRight) {
            this.changeSquare("right", 0, vPos, 1, 0);
          }
        }
        this.clearInput();
      } else {
        this.changeSquare("top", hPos, 1);
      }
    } else if (this.hasHitBottom) {
      if (hasInput) {
        if (this.isHMin) {
          if (this.isNextMoveLeft) {
            this.changeSquare("left", 1, vPos, -1, 0);
          } else if (this.isNextMoveRight) {
            this.setVector(1, 0);
          }
        } else if (this.isHMax) {
          if (this.isNextMoveLeft) {
            this.setVector(-1, 0);
          } else if (this.isNextMoveRight) {
            this.changeSquare("right", 0, vPos, 1, 0);
          }
        }
        this.clearInput();
      } else {
        this.changeSquare("bottom", hPos, 0);
      }
    }
  }

  setVector(x: number, y: number) {
    this.vector.x = x;
    this.vector.y = y;
  }

  changeSquare(
    squareKey: SquareKey,
    hPos: number = this.hPos,
    vPos: number = this.vPos,
    vectorX: number = this.vector.x,
    vectorY: number = this.vector.y
  ) {
    const { square } = this;
    const nextSquare = square[squareKey];
    if (nextSquare) {
      this.square = nextSquare;
      this.hPos = hPos;
      this.vPos = vPos;
      this.setVector(vectorX, vectorY);
    }
  }

  clearInput() {
    this.nextMove = "";
  }
}
