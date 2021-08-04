import * as React from 'react';
import { useThrottle } from '@react-hook/throttle';
import { Game } from './model/game';
import { Player } from './model/player';

const game = Game.instance;

interface Props {
  side: 'left' | 'right';
  player: Player;
  playerName: string;
}

export function Score({ side, player, playerName }: Props) {
  const [iter, setIter] = useThrottle(0, 0);

  game.animator.on('frame', () => setIter(iter + 1));
  return (
    <div className={`score ${side}`}>
      <div className="playerName">{playerName}</div>
      <div className="health-wrapper">
        <div className="health" style={{ width: `${player.health}%` }}></div>
      </div>
      <div className="points">{player.score}</div>
    </div>
  );
}
