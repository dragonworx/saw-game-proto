import { EventEmitter } from 'eventemitter3';
import { Player } from './player';
import { Graphics } from './graphics';
import { Color } from './util';
import { CutLine } from './cutLine';
import { perlin_noise } from '../util';
import Polygon from 'polygon';

export enum GridBuffers {
  Grid = 'grid',
  Holes = 'holes',
  Cuts = 'cuts',
}

export class Grid extends EventEmitter {
  hDivisions: number;
  vDivisions: number;
  width: number = 0;
  height: number = 0;
  cellWidth: number = 0;
  cellHeight: number = 0;
  graphics: Graphics;
  cutLines: CutLine[] = [];

  constructor(hDivisions: number, vDivisions: number) {
    super();
    this.hDivisions = hDivisions;
    this.vDivisions = vDivisions;
    this.graphics = new Graphics();
  }

  init(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cellWidth = width / this.hDivisions;
    this.cellHeight = height / this.vDivisions;
    this.initGraphics();
  }

  initGraphics() {
    const { width, height } = this;
    this.graphics.setSize(width, height);
    this.graphics.createBuffer(GridBuffers.Grid);
    this.graphics.createBuffer(GridBuffers.Cuts).setSize(width + 1, height + 1);
    this.graphics.createBuffer(GridBuffers.Holes);
  }

  render() {
    const { ctx, canvas } = this.graphics.getBuffer(GridBuffers.Grid);
    perlin_noise(canvas);
    ctx.fillStyle = 'darkGreen';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalAlpha = 1;
    this.renderGrid();
  }

  renderGrid() {
    const {
      cellWidth: squareWidth,
      cellHeight: squareHeight,
      width,
      height,
      graphics,
    } = this;
    const buffer = graphics.getBuffer(GridBuffers.Grid);
    const color: Color = [50, 255, 50];
    buffer.getImageData();
    for (let y = 0; y <= height; y += squareHeight) {
      buffer.drawHorizontalLine(0, width, y, color);
      for (let x = 0; x <= width; x += squareWidth) {
        buffer.drawVerticalLine(0, height, x, color);
      }
    }
    buffer.drawHorizontalLine(0, width, height - 1, color);
    buffer.drawVerticalLine(0, height, width - 1, color);
    buffer.updateImageData();
  }

  getPosition(player: Player) {
    const { cellWidth, cellHeight } = this;
    const { hOffset, vOffset, gridXIndex, gridYIndex } = player;
    let x = gridXIndex * cellWidth;
    let y = gridYIndex * cellHeight;
    if (player.isMovingLeft) {
      x -= hOffset;
    } else if (player.isMovingRight) {
      x += hOffset;
    } else if (player.isMovingUp) {
      y -= vOffset;
    } else if (player.isMovingDown) {
      y += vOffset;
    }
    return [x, y];
  }

  addCutLine(cutLine: CutLine) {
    this.cutLines.push(cutLine);
  }

  clearCutLines() {
    this.cutLines = [];
  }

  checkForCutIntersection(player: Player) {
    const { graphics, cutLines } = this;
    const cutsBuffer = graphics.getBuffer(GridBuffers.Cuts);
    const holesBuffer = graphics.getBuffer(GridBuffers.Holes);
    const { x, y } = player;
    const p = cutsBuffer.getPixelAt(x, y);
    if (p[0] === 255) {
      console.log('hit', cutLines.length);
      for (let i = cutLines.length - 1; i >= 0; i--) {
        const cutLine = cutLines[i];
        console.log('!');
        const intersectionIndex = cutLine.getIntersectionIndex(x, y);
        if (intersectionIndex > -1) {
          console.log('intersection');
          const intersectionPoints =
            cutLine.copyPointsFromIndex(intersectionIndex);
          const polygon = new Polygon(intersectionPoints);
          const area = polygon.area();
          if (area === 0) {
            console.log('nothing');
          } else {
            holesBuffer.fillPolygon(intersectionPoints, 'rgba(0,0,0,0.2');
            break;
          }
        }
      }
    }
  }

  newCutLine() {
    const newCutLine = new CutLine();
    this.cutLines.push(newCutLine);
    return newCutLine;
  }
}
