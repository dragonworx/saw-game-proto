import * as React from "react";
import { useEffect } from "react";
import { Game } from "./model/game";

const game = Game.instance;

export function GameView() {
  useEffect(() => {
    const graphicsContainer = document.getElementById(
      "graphics"
    ) as HTMLDivElement;
    const width = graphicsContainer.offsetWidth;
    const height = graphicsContainer.offsetHeight;
    game.initGraphics(width, height, graphicsContainer);
    game.setSpritesContainer(
      document.getElementById("sprites") as HTMLDivElement
    );
    setTimeout(() => {
      document.getElementById("autoFocus")?.focus();
      game.start();
    }, 0);
  }, []);

  return (
    <div id="gameView-container">
      <div id="gameView">
        <div id="graphics"></div>
        <div id="sprites"></div>
        <input id="autoFocus" />
      </div>
    </div>
  );
}
