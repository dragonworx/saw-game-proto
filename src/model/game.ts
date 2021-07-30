import { InputManager } from '../inputManager';
import { InputChannelEvent } from '../inputChannel';
import { Animator } from './animator';
import { Player } from './player';
import { createElement } from './util';
import { Graphics } from './graphics';

export const GridSubDivisions = 10;
export const PlayerSpeed = 2;

export enum GameBuffers {
  Cuts = 'fgCuts',
}

export class Game {
  static instance: Game = new Game();

  players: Player[] = [];
  inputManager: InputManager;
  animator: Animator;
  spritesContainer: HTMLDivElement;
  graphics: Graphics;

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
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  start(gameView: HTMLDivElement) {
    const { spritesContainer } = this;
    const { offsetWidth: width, offsetHeight: height } = gameView;
    this.graphics.setSize(width, height);
    this.graphics.createBuffer(GameBuffers.Cuts).setSize(width + 1, height + 1);
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
    //todo: enumerate all players and dsitribute evenly around edges
    // this.setPlayerInitialPosition(this.userPlayer);
  }

  setPlayerInitialPosition(player: Player) {
    //todo: set player initial position settings
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
    const input = this.inputManager.getChannel('player1')?.pop();
    if (input) {
      console.log(input);
    }
    this.players.forEach((player) => {});
  }
}
