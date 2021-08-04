import { InputManager } from '../inputManager';
import { Animator } from './animator';
import { Player } from './player';
import { createElement } from './util';
import { Graphics } from './graphics';
import { Grid, Direction, Buffers as GridBuffer } from './grid';

export const GridSize = 10;

export class Game {
  static instance: Game = new Game();

  players: Player[] = [];
  inputManager: InputManager;
  animator: Animator;
  spritesContainer: HTMLDivElement;
  graphics: Graphics;
  grid: Grid;

  constructor() {
    this.animator = new Animator(15);
    this.animator.on('frame', this.onFrame);
    this.inputManager = new InputManager();
    this.inputManager
      .createKeyboardChannel(
        new Map(
          Object.entries({
            Space: 'Space',
            Enter: 'Enter',
          })
        )
      )
      .on('keydown', this.onGeneralKeyInput);
    this.spritesContainer = createElement('div', 'sprites');
    this.graphics = new Graphics();
    this.grid = new Grid(GridSize, GridSize, this.spritesContainer);
  }

  newKeyboardPlayer(mapping: Map<string, string>) {
    const inputChannel = this.inputManager.createKeyboardChannel(mapping);
    const player = new Player(inputChannel);
    this.players.push(player);
  }

  init(gameView: HTMLDivElement) {
    const { spritesContainer } = this;
    const { offsetWidth: width, offsetHeight: height } = gameView;
    this.grid.init(width, height);
    this.graphics.setSize(width, height);
    this.grid.graphics.addBuffersToContainer(gameView);
    this.graphics.addBuffersToContainer(gameView);
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
    this.setPlayerToCellEdge(
      this.players[0],
      Math.floor(GridSize / 2),
      0,
      'left',
      1
    );
    if (this.players.length === 2) {
      this.setPlayerToCellEdge(
        this.players[1],
        0,
        Math.floor(GridSize / 2),
        'bottom',
        1
      );
    }
  }

  setPlayerToCellEdge(
    player: Player,
    hGridIndex: number,
    vGridIndex: number,
    edgeName: string,
    direction: Direction
  ) {
    const cell = this.grid.getCell(hGridIndex, vGridIndex);
    const edge = (cell as any)[edgeName];
    player.setEdge(edge, direction);
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
    const cutsBuffer = this.grid.graphics.getBuffer(GridBuffer.Cuts);
    cutsBuffer.batchImageDataOps(() => {
      this.players.forEach((player) => player.renderCurrentPosition());
    });
  }
}
