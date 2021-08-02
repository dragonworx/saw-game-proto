import { EventEmitter } from 'eventemitter3';
import { InputChannel, InputChannelType } from '../inputChannel';
import { CutLine } from './cutLine';
import { Edge, Direction, Buffers as GridBuffers } from './grid';
import { createElement, Point } from './util';

export const PlayerInitialSpeed = 7;

export class Player extends EventEmitter {
  edge: Edge = {} as Edge;
  direction: Direction = 1;
  offset: number = 0;
  sprite: HTMLDivElement;
  inputChannel: InputChannel<InputChannelType>;
  speed: number = PlayerInitialSpeed;
  cutLine: CutLine;

  constructor(inputChannel: InputChannel<InputChannelType>) {
    super();
    this.sprite = createElement('div', undefined, ['sprite', 'player']);
    this.inputChannel = inputChannel;
    this.inputChannel.on('keydown', this.onKeyDown);
    this.cutLine = new CutLine();
  }

  onKeyDown = (code: string) => {};

  setSpriteToCurrentPosition() {
    const [x, y] = this.edge.getPosition(this.direction, this.offset);
    this.sprite.style.left = `${x}px`;
    this.sprite.style.top = `${y}px`;
  }

  move() {
    const { direction, edge, inputChannel, speed } = this;
    const { isVertical, isHorizontal, grid } = edge;
    const buffer = edge.grid.graphics.getBuffer(GridBuffers.Grid);
    const inputPeek = inputChannel.peek();
    this.offset += Math.min(speed, grid.minCellSize);
    const hasLeftEdge = !edge.containsPosition(direction, this.offset);

    if (hasLeftEdge) {
      const toVertex = edge.getToVertex(direction);
      let overflow: number = isVertical
        ? this.offset - grid.cellHeight
        : this.offset - grid.cellWidth;
      if (inputPeek) {
        if (isVertical) {
          if (toVertex.hasBothHorizontalCuts) {
            buffer.drawPoint(toVertex.x, toVertex.y);
            const polygon = this.cutLine.getIntersectionPolygon(toVertex);
          }
          if (direction === -1) {
            this.turnIfCase([
              { keyCode: 'left', edge: edge.from.prev },
              { keyCode: 'right', edge: edge.from.next, direction: 1 },
            ]);
          } else if (direction === 1) {
            this.turnIfCase([
              { keyCode: 'left', edge: edge.to.prev, direction: -1 },
              { keyCode: 'right', edge: edge.to.next },
            ]);
          }
        } else if (isHorizontal) {
          if (toVertex.hasBothVerticalCuts) {
            buffer.drawPoint(toVertex.x, toVertex.y);
            const polygon = this.cutLine.getIntersectionPolygon(toVertex);
            buffer.fillPolygon(polygon.toArray() as Point[], 'red');
          }
          if (direction === -1) {
            this.turnIfCase([
              { keyCode: 'up', edge: edge.from.above },
              { keyCode: 'down', edge: edge.from.below, direction: 1 },
            ]);
          } else if (direction === 1) {
            this.turnIfCase([
              { keyCode: 'up', edge: edge.to.above, direction: -1 },
              { keyCode: 'down', edge: edge.to.below },
            ]);
          }
        }
      } else {
        this.setEdge(edge.getNextWrappedEdge(direction));
      }
      this.offset = overflow;
    }

    buffer.batchImageDataOps(() => {
      this.cutLine.renderCurrentPosition(buffer, direction, this.offset);
    });
  }

  turnIfCase(cases: TurnCase[]) {
    const { inputChannel, edge, direction } = this;
    const inputPeek = inputChannel.peek();
    if (
      cases.findIndex(({ keyCode, edge, direction }) => {
        if (keyCode === inputPeek) {
          if (edge) {
            this.setEdge(edge, direction);
            return true;
          }
        }
      }) === -1
    ) {
      this.setEdge(edge.getNextWrappedEdge(direction));
    }
  }

  setEdge(edge: Edge, direction?: Direction) {
    this.edge = edge;
    this.offset = 0;
    if (direction !== undefined) {
      this.direction = direction;
    }
    this.cutLine.addEdge(edge);
  }
}

interface TurnCase {
  keyCode: string;
  edge?: Edge;
  direction?: Direction;
}
