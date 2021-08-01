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

  onKeyDown = (code: string) => {
    // this.setSpriteToCurrentPosition();
  };

  setSpriteToCurrentPosition() {
    const [x, y] = this.edge.getPosition(this.direction, this.offset);
    this.sprite.style.left = `${x}px`;
    this.sprite.style.top = `${y}px`;
  }

  move() {
    const { direction, edge, inputChannel, speed } = this;
    const { isVertical, isHorizontal, grid } = edge;
    const buffer = grid.graphics.getBuffer('grid');
    this.offset += speed;
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
            // moving up
            if (inputPeek === 'ArrowLeft') {
              if (edge.from.prev) {
                this.setEdge(edge.from.prev);
              }
            } else if (inputPeek === 'ArrowRight') {
              if (edge.from.next) {
                this.setEdge(edge.from.next, 1);
              }
            } else {
              inputChannel.clearBuffer();
              this.setEdge(edge.getNextWrappedEdge(direction));
            }
          } else if (direction === 1) {
            // moving down
            if (inputPeek === 'ArrowLeft') {
              if (edge.to.prev) {
                this.setEdge(edge.to.prev, -1);
              }
            } else if (inputPeek === 'ArrowRight') {
              if (edge.to.next) {
                this.setEdge(edge.to.next);
              }
            } else {
              inputChannel.clearBuffer();
              this.setEdge(edge.getNextWrappedEdge(direction));
            }
          }
        } else if (isHorizontal) {
          // horizontal
          if (direction === -1) {
            // moving left
            if (inputPeek === 'ArrowUp') {
              if (edge.from.above) {
                this.setEdge(edge.from.above);
              }
            } else if (inputPeek === 'ArrowDown') {
              if (edge.from.below) {
                this.setEdge(edge.from.below, 1);
              }
            } else {
              inputChannel.clearBuffer();
              this.setEdge(edge.getNextWrappedEdge(direction));
            }
          } else if (direction === 1) {
            // moving right
            if (inputPeek === 'ArrowUp') {
              if (edge.to.above) {
                this.setEdge(edge.to.above, -1);
              }
            } else if (inputPeek === 'ArrowDown') {
              if (edge.to.below) {
                this.setEdge(edge.to.below);
              }
            } else {
              inputChannel.clearBuffer();
              this.setEdge(edge.getNextWrappedEdge(direction));
            }
          }
        }
        // inputChannel.clearBuffer();
      } else {
        // continue / wrap
        this.setEdge(edge.getNextWrappedEdge(direction));
      }
      this.offset = overflow;
    }
    this.edge.render(buffer, [255, 255, 255]);
    buffer.updateImageData();
  }

  turn(keyCode: string, edge: Edge, direction?: Direction) {
    const { inputChannel } = this;
  }

  setEdge(edge: Edge, direction?: Direction) {
    this.edge = edge;
    this.offset = 0;
    if (direction !== undefined) {
      this.direction = direction;
    }
  }
}
