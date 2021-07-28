import { EventEmitter } from 'eventemitter3';
import { Grid, GridBuffers } from './grid';
import { createElement } from './util';
import { CutLine } from './cutLine';
import { Buffer } from './buffer';

export class Player extends EventEmitter {
  gridXIndex: number = 0;
  gridYIndex: number = 0;
  hOffset: number = 0;
  vOffset: number = 0;
  vectorX: number = 0;
  vectorY: number = 0;
  x: number = -1;
  y: number = -1;
  lastX: number = -1;
  lastY: number = -1;
  cutLine: CutLine;
  sprite: HTMLDivElement;
  nextMove: string = '';

  constructor() {
    super();
    this.sprite = createElement('div', undefined, ['sprite', 'player']);
    this.cutLine = new CutLine();
  }

  get isVerticalMovement() {
    return this.vectorY !== 0;
  }

  get isHorizontalMovement() {
    return this.vectorX !== 0;
  }

  get hasInput() {
    return this.nextMove !== '';
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
      (this.isVerticalMovement && this.vOffset === 0) ||
      (this.isHorizontalMovement && this.hOffset === 0)
    );
  }

  setNextMove(keyCode: string) {
    this.nextMove = keyCode;
  }

  clearInput() {
    this.nextMove = '';
  }

  setInitialPosition(
    gridXIndex: number,
    gridYIndex: number,
    vectorX: number,
    vectorY: number,
    grid: Grid
  ) {
    this.hOffset = 0;
    this.vOffset = 0;
    this.gridXIndex = gridXIndex;
    this.gridYIndex = gridYIndex;
    this.vectorX = vectorX;
    this.vectorY = vectorY;
    const [x, y] = grid.getPosition(this);
    this.lastX = this.x = x;
    this.lastY = this.y = y;
  }

  updatePosition(grid: Grid) {
    const [x, y] = grid.getPosition(this);
    this.x = x;
    this.y = y;
  }

  setSpriteToCurrentPosition() {
    const { sprite, x, y } = this;
    sprite.style.left = `${x}px`;
    sprite.style.top = `${y}px`;
  }

  markLastPos() {
    this.lastX = this.x;
    this.lastY = this.y;
  }

  move(speed: number, grid: Grid) {
    const { cellWidth: squareWidth, cellHeight: squareHeight } = grid;
    const { nextMove } = this;
    if (this.isVerticalMovement) {
      this.vOffset = this.vOffset + speed;
      if (this.vOffset > squareHeight) {
        const didWrap = this.moveToNextGridIndexByVector(grid);
        if (this.hasInput) {
          if (nextMove === 'ArrowLeft') {
            this.setVector(-1, 0);
            this.newCutPoint(grid);
          } else if (nextMove === 'ArrowRight') {
            this.setVector(1, 0);
            this.newCutPoint(grid);
          }
          this.clearInput();
        } else {
          !didWrap && this.newCutPoint(grid);
        }
      }
    } else if (this.isHorizontalMovement) {
      this.hOffset = this.hOffset + speed;
      if (this.hOffset > squareWidth) {
        const didWrap = this.moveToNextGridIndexByVector(grid);
        if (this.hasInput) {
          if (nextMove === 'ArrowUp') {
            this.setVector(0, -1);
            this.newCutPoint(grid);
          } else if (nextMove === 'ArrowDown') {
            this.setVector(0, 1);
            this.newCutPoint(grid);
          }
          this.clearInput();
        } else {
          !didWrap && this.newCutPoint(grid);
        }
      }
    }
  }

  moveToNextGridIndexByVector(grid: Grid) {
    const { hDivisions, vDivisions } = grid;
    const { gridXIndex, gridYIndex, vectorX, vectorY, hOffset, vOffset } = this;
    let xIndex = gridXIndex + vectorX;
    let yIndex = gridYIndex + vectorY;
    const hasHMovement = hOffset > 0;
    const hasVMovement = vOffset > 0;

    const hasCrossedLeftBounds =
      xIndex === 0 && this.isMovingLeft && hasHMovement;
    const hasCrossedRightBounds =
      xIndex === hDivisions && this.isMovingRight && hasHMovement;
    const hasCrossedTopBounds = yIndex === 0 && this.isMovingUp && hasVMovement;
    const hasCrossedBottomBounds =
      yIndex === vDivisions && this.isMovingDown && hasVMovement;
    const didWrap =
      hasCrossedLeftBounds ||
      hasCrossedRightBounds ||
      hasCrossedTopBounds ||
      hasCrossedBottomBounds;

    this.gridXIndex = xIndex;
    this.gridYIndex = yIndex;
    this.hOffset = this.vOffset = 0;

    if (didWrap) {
      this.newCutPoint(grid);
    }

    if (hasCrossedLeftBounds) {
      xIndex = hDivisions;
    } else if (hasCrossedRightBounds) {
      xIndex = 0;
    } else if (hasCrossedTopBounds) {
      yIndex = vDivisions;
    } else if (hasCrossedBottomBounds) {
      yIndex = 0;
    }

    this.gridXIndex = xIndex;
    this.gridYIndex = yIndex;

    if (didWrap) {
      this.updatePosition(grid);
      this.markLastPos();
      this.trimCutLine(grid);
    }

    return didWrap;
  }

  trimCutLine(grid: Grid) {
    this.cutLine = grid.newCutLine();
    this.newCutPoint(grid);
  }

  setVector(x: number, y: number) {
    this.vectorX = x;
    this.vectorY = y;
    this.hOffset = this.vOffset = 0;
  }

  newCutPoint(grid: Grid) {
    this.updatePosition(grid);
    if (this.cutLine.points.length > 0) {
      const lastPoint = this.cutLine.points[this.cutLine.points.length - 1];
      if (lastPoint[0] === this.x && lastPoint[1] === this.y) {
        return;
      }
    }
    this.cutLine.addPoint(this.x, this.y);
    grid.checkForCutIntersection(this);
    this.cutLine.renderLines(grid.graphics.getBuffer(GridBuffers.Cuts));
  }

  renderCutLine(buffer: Buffer) {
    const { ctx } = buffer;
    const { lastX, lastY, x, y } = this;
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.stroke();
  }
}
