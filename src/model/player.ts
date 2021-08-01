import { EventEmitter } from 'eventemitter3';
import { InputChannel, InputChannelType } from '../inputChannel';
import { Edge, Direction } from './Grid';
import { createElement } from './util';

export class Player extends EventEmitter {
  edge: Edge = {} as Edge;
  direction: Direction = 1;
  offset: number = 0;
  sprite: HTMLDivElement;
  inputChannel: InputChannel<InputChannelType>;

  constructor(inputChannel: InputChannel<InputChannelType>) {
    super();
    this.sprite = createElement('div', undefined, ['sprite', 'player']);
    this.inputChannel = inputChannel;
    // this.inputChannel.on('keypress', this.onKeyDown);
  }

  // onKeyDown = (code: string) => {
  //   this.move(5);
  //   this.setSpriteToCurrentPosition();
  // };

  setSpriteToCurrentPosition() {
    const [x, y] = this.edge.getPosition(this.direction, this.offset);
    this.sprite.style.left = `${x}px`;
    this.sprite.style.top = `${y}px`;
  }

  move(speed: number) {
    const { direction, edge, inputChannel } = this;
    const buffer = edge.grid.graphics.getBuffer('grid');
    this.offset += speed;
    const [x, y, hasLeftEdge] = edge.getPosition(direction, this.offset);
    const inputPeek = inputChannel.peek();
    if (hasLeftEdge) {
      if (inputPeek) {
        // turn
        if (edge.isVertical) {
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
            }
          } else {
            // moving down
            if (inputPeek === 'ArrowLeft') {
              if (edge.to.prev) {
                this.setEdge(edge.to.prev, -1);
              }
            } else if (inputPeek === 'ArrowRight') {
              if (edge.to.next) {
                this.setEdge(edge.to.next);
              }
            }
          }
        } else {
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
            }
          } else {
            // moving right
            if (inputPeek === 'ArrowUp') {
              if (edge.to.above) {
                this.setEdge(edge.to.above, -1);
              }
            } else if (inputPeek === 'ArrowDown') {
              if (edge.to.below) {
                this.setEdge(edge.to.below);
              }
            }
          }
        }
        inputChannel.clearBuffer();
      } else {
        // continue / wrap
        this.setEdge(edge.getNextWrappedEdge(direction));
      }
    }
    this.edge.render(buffer, [255, 255, 255]);
    buffer.updateImageData();
  }

  setEdge(edge: Edge, direction?: Direction) {
    this.edge = edge;
    this.offset = 0;
    if (direction !== undefined) {
      this.direction = direction;
    }
  }
}
