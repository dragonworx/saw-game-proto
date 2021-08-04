import { EventEmitter } from 'eventemitter3';
import { InputChannel, InputChannelType } from '../inputChannel';
import { CutLine } from './cutLine';
import { Edge, Direction, Buffers as GridBuffers, Vertex } from './grid';
import { createElement, randomColor, rgb, Color } from './util';

export const PlayerInitialSpeed = 7;
export const PlayerCrashDamage = 5;

export class Player extends EventEmitter {
  edge: Edge = {} as Edge;
  direction: Direction = 1;
  offset: number = 0;
  sprite: HTMLDivElement;
  inputChannel: InputChannel<InputChannelType>;
  speed: number = PlayerInitialSpeed;
  score: number = 0;
  health: number = 100;
  lastX: number = 0;
  lastY: number = 0;

  constructor(inputChannel: InputChannel<InputChannelType>) {
    super();
    this.sprite = createElement('div', undefined, ['sprite', 'player']);
    this.inputChannel = inputChannel;
    this.inputChannel.on('keydown', this.onKeyDown);
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
    const inputPeek = inputChannel.peek();
    this.offset += Math.min(speed, grid.minCellSize);
    const hasLeftEdge = !edge.containsPosition(direction, this.offset);
    if (hasLeftEdge) {
      const toVertex = edge.getToVertex(direction);
      let overflow: number = isVertical
        ? this.offset - grid.cellHeight
        : this.offset - grid.cellWidth;
      if (isVertical) {
        if (toVertex.hasHorizontalCuts) {
          this.interset();
        }
      } else if (isHorizontal) {
        if (toVertex.hasVerticalCuts) {
          this.interset();
        }
      }
      if (inputPeek) {
        if (isVertical) {
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
      this.checkForCrash();
      const vertex = edge.getToVertex(direction);
      const buffer = edge.grid.graphics.getBuffer(GridBuffers.Cuts);
      buffer.batchImageDataOps(() => {
        buffer.drawStraightLine(
          this.lastX,
          this.lastY,
          vertex.x,
          vertex.y,
          [255, 255, 255]
        );
      });
    }
    const [x, y] = this.edge.getPosition(this.direction, this.offset);
    this.lastX = x;
    this.lastY = y;
  }

  turnIfCase(cases: TurnCase[]) {
    const { inputChannel, edge, direction } = this;
    const inputPeek = inputChannel.peek();
    let hasTurned = false;
    if (
      cases.findIndex(({ keyCode, edge, direction }) => {
        if (keyCode === inputPeek) {
          if (edge) {
            this.setEdge(edge, direction);
            return (hasTurned = true);
          }
        }
      }) === -1
    ) {
      this.setEdge(edge.getNextWrappedEdge(direction));
    }
    return hasTurned;
  }

  checkForCrash() {
    const { edge } = this;
    const { isVertical, isHorizontal } = edge;
    const cell = edge.getCell()!;
    const buffer = edge.grid.graphics.getBuffer(GridBuffers.Grid);
    if (isVertical) {
      const prevCell = edge.getPrevCell();
      if (prevCell) {
        if (prevCell.isEmpty && cell.isEmpty) {
          buffer.fillBounds(cell.bounds, 'red');
          buffer.fillBounds(prevCell.bounds, 'red');
          this.takeDamage(PlayerCrashDamage);
        }
      }
    } else if (isHorizontal) {
      const aboveCell = edge.getAboveCell();
      if (aboveCell) {
        if (aboveCell.isEmpty && cell.isEmpty) {
          buffer.fillBounds(cell.bounds, 'red');
          buffer.fillBounds(aboveCell.bounds, 'red');
          this.takeDamage(PlayerCrashDamage);
        }
      }
    }
  }

  takeDamage(damage: number) {
    this.health = Math.max(0, this.health - damage);
    if (this.health === 0) {
      console.log('DEAD!');
    }
  }

  addScore(points: number) {
    this.score += points;
  }

  setEdge(edge: Edge, direction?: Direction) {
    this.edge = edge;
    this.offset = 0;
    if (direction !== undefined) {
      this.direction = direction;
    }
    edge.isCut = true;
  }

  renderCurrentPosition() {
    const { edge, direction, offset } = this;
    const buffer = edge.grid.graphics.getBuffer(GridBuffers.Cuts);
    const [x, y] = edge.getPosition(direction, offset);
    if (edge.isVertical) {
      buffer.drawVerticalLine(
        edge.getFromVertex(direction).y,
        y,
        x,
        [255, 255, 255]
      );
    } else {
      buffer.drawHorizontalLine(
        edge.getFromVertex(direction).x,
        x,
        y,
        [255, 255, 255]
      );
    }
  }

  interset() {
    const { direction, edge } = this;
    const { grid } = edge;
    const buffer = grid.graphics.getBuffer(GridBuffers.Cuts);
    const toVertex = edge.getToVertex(direction);
    buffer.drawPoint(toVertex.x, toVertex.y);
    const seen: Map<Edge, boolean> = new Map();
    const color = randomColor();
    const cutLine: CutLine = new CutLine();
    this.traceEdgeForIntersection(
      edge,
      direction,
      toVertex,
      seen,
      color,
      cutLine
    );
    const emptyCells = grid.cutCells(cutLine);
    this.addScore(emptyCells.size);
    const gridBuffer = grid.graphics.getBuffer(GridBuffers.Grid);
    setTimeout(() => {
      buffer.batchImageDataOps(() => cutLine.render(buffer, [0, 0, 0, 0]));
      gridBuffer.batchImageDataOps(() =>
        cutLine.render(gridBuffer, [100, 100, 100])
      );
    }, 1000);
  }

  traceEdgeForIntersection(
    edge: Edge,
    direction: Direction,
    destVertex: Vertex,
    seen: Map<Edge, boolean>,
    color: Color,
    cutLine: CutLine
  ) {
    const buffer = edge.grid.graphics.getBuffer(GridBuffers.Cuts);
    const vertex = edge.getFromVertex(direction);
    if (seen.has(edge)) {
      return;
    }
    if (vertex === destVertex) {
      buffer.drawPoint(vertex.x, vertex.y, rgb(color), 15);
      buffer.batchImageDataOps(() => {
        // edge.render(buffer, color);
        cutLine.addEdge(edge);
      });
      return;
    }
    // buffer.drawPoint(vertex.x, vertex.y, rgb(color), 5);
    buffer.batchImageDataOps(() => {
      // edge.render(buffer, color);
      cutLine.addEdge(edge);
    });
    seen.set(edge, true);
    if (vertex.above && vertex.above.isCut) {
      this.traceEdgeForIntersection(
        vertex.above,
        1,
        destVertex,
        seen,
        color,
        cutLine
      );
    }
    if (vertex.below && vertex.below.isCut) {
      this.traceEdgeForIntersection(
        vertex.below,
        -1,
        destVertex,
        seen,
        color,
        cutLine
      );
    }
    if (vertex.prev && vertex.prev.isCut) {
      this.traceEdgeForIntersection(
        vertex.prev,
        1,
        destVertex,
        seen,
        color,
        cutLine
      );
    }
    if (vertex.next && vertex.next.isCut) {
      this.traceEdgeForIntersection(
        vertex.next,
        -1,
        destVertex,
        seen,
        color,
        cutLine
      );
    }
  }
}

interface TurnCase {
  keyCode: string;
  edge?: Edge;
  direction?: Direction;
}
