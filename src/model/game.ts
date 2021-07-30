import { InputManager } from '../inputManager';
import { InputChannelEvent } from '../inputChannel';
import { Animator } from './animator';
import { Player } from './player';
import { createElement } from './util';
import { Graphics } from './graphics';
import { Grid, Buffers as GridBuffers } from './Grid';

export const GridSize = 20;
export const PlayerSpeed = 5;

export class Game {
  static instance: Game = new Game();

  players: Player[] = [];
  inputManager: InputManager;
  animator: Animator;
  spritesContainer: HTMLDivElement;
  graphics: Graphics;
  grid: Grid;

  constructor() {
    this.animator = new Animator(24);
    this.animator.on('frame', this.onFrame);
    this.inputManager = new InputManager();
    this.inputManager
      .createChannel('general', ['Space', 'Enter'])
      .on('keydown', this.onGeneralKeyInput);
    this.inputManager
      .createChannel('player1', [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
      ])
      .on('keydown', this.onPlayerKeyInput);
    this.spritesContainer = createElement('div', 'sprites');
    this.graphics = new Graphics();
    this.grid = new Grid(GridSize, GridSize);
  }

  get userPlayer() {
    return this.players[0];
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

  addPlayer(player: Player) {
    this.players.push(player);
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

  onGeneralKeyInput = (event: InputChannelEvent) => {
    switch (event.code) {
      case 'Space':
        this.animator.toggleRunning();
        break;
      case 'Enter':
        this.step();
    }
  };

  onPlayerKeyInput = (event: InputChannelEvent) => {};

  onFrame = (currentFps: number, elapsedTime: number) => {
    this.step();
  };

  step() {
    const userPlayer = this.userPlayer;
    this.players.forEach((player) => {
      player
        .move(
          PlayerSpeed,
          player === userPlayer
            ? this.inputManager.getChannel('player1')
            : undefined
        )
        .setSpriteToCurrentPosition();
    });
  }
}
