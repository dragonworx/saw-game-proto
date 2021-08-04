import * as React from 'react';
import { GameView } from './game';
import { Score } from './score';
import { Game } from './model/game';

const game = Game.instance;

export function App() {
  return (
    <div id="app">
      <GameView />
      <Score side="left" player={game.players[0]} playerName="Player 1" />
      {game.players.length === 2 ? (
        <Score side="right" player={game.players[1]} playerName="Player 2" />
      ) : null}
    </div>
  );
}
