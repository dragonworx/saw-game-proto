import * as React from 'react';
import { GameView } from './gameView';
import { FPS } from './fps';

export function App() {
  return (
    <div id="app">
      <GameView />
      <FPS />
    </div>
  );
}
