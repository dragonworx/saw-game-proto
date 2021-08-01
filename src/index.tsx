import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './app';
import { Game } from './model/game';

Game.instance.newKeyboardPlayer([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
]);

ReactDOM.render(<App />, document.getElementById('main'));
