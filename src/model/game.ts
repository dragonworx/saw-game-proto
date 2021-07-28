import { EventEmitter } from 'eventemitter3';
import { InputManager, KeyEvent } from '../inputManager';
import { throttled } from '../util';
import { Player } from './player';
import { Grid, GridBuffers } from './grid';
import { createElement } from './util';
import { Graphics } from './graphics';

export const GridSubDivisions = 10;
export const PlayerSpeed = 2;

export const AcceptPlayerInput = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
];

export enum GameBuffers {
  Cuts = 'fgCuts',
}

export class Game extends EventEmitter {
  static instance: Game = new Game();

  players: Player[] = [];
  userPlayer: Player;
  grid: Grid;
  inputManager: InputManager;
  spritesContainer: HTMLDivElement;
  width: number = 0;
  height: number = 0;
  lastTime: number = -1;
  isRunning: boolean = true;
  graphics: Graphics;

  constructor() {
    super();
    this.inputManager = new InputManager([
      ...AcceptPlayerInput,
      'Space',
      'Enter',
    ]);
    this.spritesContainer = createElement('div', 'sprites');
    this.grid = new Grid(GridSubDivisions, GridSubDivisions);
    this.inputManager.on('keydown', throttled(this.onKeyDown, 1000 / 60));
    this.graphics = new Graphics();
    const userPlayer = (this.userPlayer = new Player());
    this.addPlayer(userPlayer);
  }

  addPlayer(player: Player) {
    this.players.push(player);
    this.grid.addCutLine(player.cutLine);
  }

  init(gameView: HTMLDivElement) {
    const { grid, spritesContainer } = this;
    const { offsetWidth: width, offsetHeight: height } = gameView;
    grid.init(width, height);
    this.graphics.setSize(width, height);
    this.graphics.createBuffer(GameBuffers.Cuts).setSize(width + 1, height + 1);
    gameView.appendChild(grid.graphics.getCanvas(GridBuffers.Grid));
    gameView.appendChild(grid.graphics.getCanvas(GridBuffers.Holes));
    gameView.appendChild(grid.graphics.getCanvas(GridBuffers.Cuts));
    gameView.appendChild(this.graphics.getCanvas(GameBuffers.Cuts));
    gameView.appendChild(spritesContainer);
    this.grid.render();
  }

  setSpritesContainer(element: HTMLDivElement) {
    this.spritesContainer = element;
  }

  start() {
    this.reset();
    this.startAnimation();
  }

  startAnimation() {
    requestAnimationFrame(this.update);
  }

  reset() {
    // this.grid.clearCutLines();
    this.distributePlayerInitialPositions();
    this.addPlayerElementsToSprites();
    this.setPlayersInitialPositions();
  }

  distributePlayerInitialPositions() {
    this.setPlayerInitialPosition(
      this.userPlayer,
      this.grid.hDivisions,
      this.grid.vDivisions / 2,
      -1,
      0
    );
  }

  setPlayerInitialPosition(
    player: Player,
    gridXIndex: number,
    gridYIndex: number,
    vectorX: number,
    vectorY: number
  ) {
    const { grid } = this;
    player.gridXIndex = gridXIndex;
    player.gridYIndex = gridYIndex;
    player.setVector(vectorX, vectorY);
    player.setInitialPosition(gridXIndex, gridYIndex, vectorX, vectorY, grid);
  }

  addPlayerElementsToSprites() {
    const { spritesContainer } = this;
    if (spritesContainer) {
      this.players.forEach((player) => {
        spritesContainer.appendChild(player.sprite);
      });
    }
  }

  setPlayersInitialPositions() {
    const { grid } = this;
    this.players.forEach((player) => {
      player.newCutPoint(grid);
      player.setSpriteToCurrentPosition();
    });
  }

  onKeyDown = (e: KeyEvent) => {
    if (AcceptPlayerInput.includes(e.code)) {
      this.userPlayer.setNextMove(e.code);
    } else {
      switch (e.code) {
        case 'Space':
          this.isRunning = !this.isRunning;
          if (this.isRunning) {
            this.startAnimation();
          }
          break;
        case 'Enter':
          this.update(0);
      }
    }
  };

  update = (currentTime: number) => {
    if (this.lastTime === -1) {
      this.lastTime === currentTime;
    }
    const deltaTime = currentTime - this.lastTime;
    const fps = Math.round(1000 / deltaTime);
    this.emit('fps', fps);
    this.step();
    this.lastTime = currentTime;
    if (this.isRunning) {
      requestAnimationFrame(this.update);
    }
  };

  step() {
    const { grid } = this;
    this.players.forEach((player) => {
      player.move(PlayerSpeed, grid);
      player.updatePosition(grid);
      player.setSpriteToCurrentPosition();
      // player.renderCutLine(this.graphics.getBuffer(GameBuffers.Cuts));
      player.markLastPos();
    });
  }
}
