import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './app';
import { Game } from './model/game';

Game.instance.newKeyboardPlayer(
  new Map(
    Object.entries({
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
    })
  )
);

Game.instance.newKeyboardPlayer(
  new Map(
    Object.entries({
      KeyA: 'left',
      KeyD: 'right',
      KeyW: 'up',
      KeyS: 'down',
    })
  )
);

ReactDOM.render(<App />, document.getElementById('main'));
