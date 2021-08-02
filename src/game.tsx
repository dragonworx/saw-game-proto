import * as React from 'react';
import { useEffect } from 'react';
import { Game } from './model/game';

const game = Game.instance;

export function GameView() {
  useEffect(() => {
    game.init(document.getElementById('gameView') as HTMLDivElement);
    setTimeout(() => document.getElementById('autoFocus')!.focus(), 0);
  }, []);

  return (
    <div id="gameView-container">
      <div id="gameView">
        <input id="autoFocus" />
      </div>
    </div>
  );
}
