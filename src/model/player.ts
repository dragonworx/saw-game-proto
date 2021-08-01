import { EventEmitter } from 'eventemitter3';
import { InputChannel, InputChannelType } from '../inputChannel';
import { Edge, Direction } from './Grid';
import { createElement } from './util';

export const PlayerInitialSpeed = 7;

export class Player extends EventEmitter {
  edge: Edge = {} as Edge;
  direction: Direction = 1;
  offset: number = 0;
  sprite: HTMLDivElement;
  inputChannel: InputChannel<InputChannelType>;
  speed: number = PlayerInitialSpeed;

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
    const buffer = grid.graphics.getBuffer('grid');
    this.offset += Math.min(speed, grid.minCellSize);
    const [_x, _y, hasLeftEdge] = edge.getPosition(direction, this.offset);
    const inputPeek = inputChannel.peek();
    if (hasLeftEdge) {
      let overflow: number = isVertical
        ? this.offset - grid.cellHeight
        : this.offset - grid.cellWidth;
      if (inputPeek) {
        // turn
        if (isVertical) {
          // vertical
          if (direction === -1) {
            this.turnIfCase([
              { keyCode: 'ArrowLeft', edge: edge.from.prev },
              { keyCode: 'ArrowRight', edge: edge.from.next, direction: 1 },
            ]);
          } else if (direction === 1) {
            this.turnIfCase([
              { keyCode: 'ArrowLeft', edge: edge.to.prev, direction: -1 },
              { keyCode: 'ArrowRight', edge: edge.to.next },
            ]);
          }
        } else if (isHorizontal) {
          // horizontal
          if (direction === -1) {
            this.turnIfCase([
              { keyCode: 'ArrowUp', edge: edge.from.above },
              { keyCode: 'ArrowDown', edge: edge.from.below, direction: 1 },
            ]);
          } else if (direction === 1) {
            this.turnIfCase([
              { keyCode: 'ArrowUp', edge: edge.to.above, direction: -1 },
              { keyCode: 'ArrowDown', edge: edge.to.below },
            ]);
          }
        }
      } else {
        // continue / wrap
        this.setEdge(edge.getNextWrappedEdge(direction));
      }
      this.offset = overflow;
    }
    this.edge.render(buffer, [255, 255, 255]);
    buffer.updateImageData();
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
  }
}

interface TurnCase {
  keyCode: string;
  edge?: Edge;
  direction?: Direction;
}
