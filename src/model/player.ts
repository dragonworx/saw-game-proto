import { EventEmitter } from 'eventemitter3';
import { InputChannel, InputChannelType } from '../inputChannel';
import { CutLine } from './cutLine';
import { Edge, Direction, Buffers as GridBuffers, Vertex } from './grid';
import { createElement, randomColor, rgb, Color } from './util';

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
    }
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

  interset() {
    const { direction, edge } = this;
    const { isVertical, grid } = edge;
    const buffer = grid.graphics.getBuffer(GridBuffers.Cuts);
    const toVertex = edge.getToVertex(direction);
    const edgeA = isVertical ? toVertex.prev : toVertex.above;
    const edgeB = isVertical ? toVertex.next : toVertex.below;
    buffer.drawPoint(toVertex.x, toVertex.y);
    buffer.batchImageDataOps(() => {
      edgeA && edgeA.isCut && edgeA.render(buffer, [255, 255, 255]);
      edgeB && edgeB.isCut && edgeB.render(buffer, [255, 255, 255]);
    });

    const seen: Map<Edge, boolean> = new Map();
    const color = randomColor();
    this.traceEdgeForIntersection(edge, direction, toVertex, seen, color);

    // Need algorithm which backtracks each edge from the current intersection edge
    // It needs to recursively trace each edge and follow back to the intersection point
    // This will produce the intersection Polygon

    // const polygon = this.cutLine.getIntersectionPolygon(toVertex);
    // polygon.toArray().forEach((p) => buffer.drawPoint(p[0], p[1], 'pink'));
    // buffer.fillPolygon(polygon.toArray() as Point[], 'red');
    // this.cutLine.clear();
  }

  traceEdgeForIntersection(
    edge: Edge,
    direction: Direction,
    destVertex: Vertex,
    seen: Map<Edge, boolean>,
    color: Color
  ) {
    if (seen.has(edge)) {
      return;
    }
    const buffer = edge.grid.graphics.getBuffer(GridBuffers.Cuts);
    const vertex = edge.getFromVertex(direction);
    if (vertex === destVertex) {
      buffer.drawPoint(vertex.x, vertex.y, rgb(color), 15);
      return;
    }
    buffer.drawPoint(vertex.x, vertex.y, rgb(color), 5);
    buffer.batchImageDataOps(() => {
      edge.render(buffer, color);
    });
    seen.set(edge, true);
    if (vertex.above && vertex.above.isCut) {
      this.traceEdgeForIntersection(vertex.above, 1, destVertex, seen, color);
    }
    if (vertex.below && vertex.below.isCut) {
      this.traceEdgeForIntersection(vertex.below, -1, destVertex, seen, color);
    }
    if (vertex.prev && vertex.prev.isCut) {
      this.traceEdgeForIntersection(vertex.prev, 1, destVertex, seen, color);
    }
    if (vertex.next && vertex.next.isCut) {
      this.traceEdgeForIntersection(vertex.next, -1, destVertex, seen, color);
    }
  }
}

interface TurnCase {
  keyCode: string;
  edge?: Edge;
  direction?: Direction;
}
