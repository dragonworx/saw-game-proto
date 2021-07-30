import { EventEmitter } from 'eventemitter3';
import { createElement } from './util';

export class Player extends EventEmitter {
  sprite: HTMLDivElement;

  constructor() {
    super();
    this.sprite = createElement('div', undefined, ['sprite', 'player']);
  }

  setSpriteToCurrentPosition() {}
}
