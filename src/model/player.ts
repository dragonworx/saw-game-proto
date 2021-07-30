import { EventEmitter } from 'eventemitter3';
import { InputChannel } from '../inputChannel';
import { Edge, Direction } from './Grid';
import { createElement } from './util';

export class Player extends EventEmitter {
  edge: Edge = {} as Edge;
  direction: Direction = 1;
  offset: number = 0;
  sprite: HTMLDivElement;

  constructor() {
    super();
    this.sprite = createElement('div', undefined, ['sprite', 'player']);
  }

  setEdge(edge: Edge, direction?: Direction) {
    this.edge = edge;
    this.offset = 0;
    if (direction !== undefined) {
      this.direction = direction;
    }
  }

  setSpriteToCurrentPosition() {
    const [x, y] = this.edge.getPosition(this.direction, this.offset);
    this.sprite.style.left = `${x}px`;
    this.sprite.style.top = `${y}px`;
  }

  move(speed: number, input?: InputChannel) {
    const { direction, edge } = this;
    const buffer = edge.grid.graphics.getBuffer('grid');
    this.offset += speed;
    const [x, y, hasLeftEdge] = edge.getPosition(direction, this.offset);
    if (hasLeftEdge) {
      if (input && input.peek()) {
        // turn
        if (edge.isVertical) {
          // vertical
          if (direction === -1) {
            // moving up
            if (input.peek() === 'ArrowLeft') {
              if (edge.from.prev) {
                this.setEdge(edge.from.prev);
              }
            } else if (input.peek() === 'ArrowRight') {
              if (edge.from.next) {
                this.setEdge(edge.from.next, 1);
              }
            }
          } else {
            // moving down
            if (input.peek() === 'ArrowLeft') {
              if (edge.to.prev) {
                this.setEdge(edge.to.prev, -1);
              }
            } else if (input.peek() === 'ArrowRight') {
              if (edge.to.next) {
                this.setEdge(edge.to.next);
              }
            }
          }
        } else {
          // horizontal
          if (direction === -1) {
            // moving left
            if (input.peek() === 'ArrowUp') {
              if (edge.from.above) {
                this.setEdge(edge.from.above);
              }
            } else if (input.peek() === 'ArrowDown') {
              if (edge.from.below) {
                this.setEdge(edge.from.below, 1);
              }
            }
          } else {
            // moving right
            if (input.peek() === 'ArrowUp') {
              if (edge.to.above) {
                this.setEdge(edge.to.above, -1);
              }
            } else if (input.peek() === 'ArrowDown') {
              if (edge.to.below) {
                this.setEdge(edge.to.below);
              }
            }
          }
        }
        input.clearBuffer();
      } else {
        // continue / wrap
        this.setEdge(edge.getNextWrappedEdge(direction));
      }
    }
    this.edge.render(buffer, [255, 255, 255]);
    buffer.updateImageData();
    return this;
  }
}
