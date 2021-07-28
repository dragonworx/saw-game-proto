import * as React from 'react';
import { useThrottle } from '@react-hook/throttle';
import { Game } from './model/game';

const game = Game.instance;

export function FPS() {
  const [fps, setFps] = useThrottle(0, 1);

  game.on('fps', (fps) => setFps(fps));

  if (fps === 0) {
    return null;
  }

  return <div id="fps">{fps} fps</div>;
}
