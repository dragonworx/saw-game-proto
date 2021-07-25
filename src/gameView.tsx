import * as React from "react";
import { useState, useEffect } from "react";
import { Game } from "./model/game";
import { perlin_noise } from "./util";

const game = Game.instance;

const getCSSVar = (element: HTMLElement, varName: string) =>
  parseFloat(getComputedStyle(element).getPropertyValue(varName).trim());

export function GameView() {
  useEffect(() => {
    const element = document.getElementById("gameView")!;
    const width = getCSSVar(element, "--canvas-width");
    const height = getCSSVar(element, "--canvas-height");
    const fgCanvas = document.getElementById("canvas-bg") as HTMLCanvasElement;
    const bgCanvas = document.getElementById("canvas-fg") as HTMLCanvasElement;
    fgCanvas.width = bgCanvas.width = width;
    fgCanvas.height = bgCanvas.height = height;
    game.init(
      { width, height },
      {
        fgCanvas,
        bgCanvas,
        fgCtx: fgCanvas.getContext("2d")!,
        bgCtx: bgCanvas.getContext("2d")!,
        sprites: document.getElementById("sprites") as HTMLDivElement,
      }
    );
    setTimeout(() => {
      document.getElementById("autoFocus")?.focus();
    }, 0);
    perlin_noise(fgCanvas);
  }, []);

  return (
    <div id="gameView-container">
      <div id="gameView">
        <canvas id="canvas-bg"></canvas>
        <canvas id="canvas-fg"></canvas>
        <div id="sprites"></div>
        <input id="autoFocus" />
      </div>
    </div>
  );
}
