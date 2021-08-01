import { InputManager } from '../inputManager';
import { Animator } from './animator';
import { Player } from './player';
import { createElement } from './util';
import { Graphics } from './graphics';
import { Grid, Buffers as GridBuffers } from './Grid';

export const GridSize = 20;

export class Game {
  static instance: Game = new Game();

  players: Player[] = [];
  inputManager: InputManager;
  animator: Animator;
  spritesContainer: HTMLDivElement;
  graphics: Graphics;
  grid: Grid;

  constructor() {
    this.animator = new Animator(25);
    this.animator.on('frame', this.onFrame);
    this.inputManager = new InputManager();
    this.inputManager
      .createKeyboardChannel('general', ['Space', 'Enter'])
      .on('keydown', this.onGeneralKeyInput);
    this.spritesContainer = createElement('div', 'sprites');
    this.graphics = new Graphics();
    this.grid = new Grid(GridSize, GridSize);
  }

  get userPlayer() {
    return this.players[0];
  }

  newKeyboardPlayer(filter: string[] = []) {
    const inputChannel = this.inputManager.createKeyboardChannel(
      'player1',
      filter
    );
    const player = new Player(inputChannel);
    this.players.push(player);
  }

  start(gameView: HTMLDivElement) {
    const { spritesContainer } = this;
    const { offsetWidth: width, offsetHeight: height } = gameView;
    this.grid.init(width, height);
    this.graphics.setSize(width, height);
    gameView.appendChild(this.grid.graphics.getBuffer(GridBuffers.Grid).canvas);
    gameView.appendChild(spritesContainer);
    this.reset();
    this.animator.start();
  }

  setSpritesContainer(element: HTMLDivElement) {
    this.spritesContainer = element;
  }

  reset() {
    this.distributePlayerInitialPositions();
    this.addPlayerElementsToSprites();
    this.setPlayersInitialPositions();
  }

  distributePlayerInitialPositions() {
    //todo: enumerate all players and distribute evenly around edges
    const cell = this.grid.getCell(Math.floor(GridSize / 2), 0);
    cell.render(
      this.grid.graphics.getBuffer(GridBuffers.Grid),
      'rgba(0,255,0,0.2)'
    );
    const edge = cell.left;
    this.userPlayer.setEdge(edge, 1);
  }

  addPlayerElementsToSprites() {
    const { spritesContainer } = this;
    if (spritesContainer) {
      this.players.forEach((player) =>
        spritesContainer.appendChild(player.sprite)
      );
    }
  }

  setPlayersInitialPositions() {
    this.players.forEach((player) => {
      player.setSpriteToCurrentPosition();
    });
  }

  onGeneralKeyInput = (code: string) => {
    switch (code) {
      case 'Space':
        this.animator.toggleRunning();
        break;
      case 'Enter':
        this.step();
    }
  };

  onFrame = (currentFps: number, elapsedTime: number) => {
    this.step();
  };

  step() {
    this.players.forEach((player) => {
      player.move();
      player.setSpriteToCurrentPosition();
    });
  }
}
