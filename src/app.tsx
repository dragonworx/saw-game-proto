import * as React from 'react';
import { GameView } from './game';
import { FPS } from './fps';

export function App() {
  return (
    <div id="app">
      <GameView />
      <FPS />
    </div>
  );
}
