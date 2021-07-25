import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./app";
import { Game } from "./model/game";
import { Player } from "./model/player";

[
  // new Player(),
  // new Player(),
  // new Player(),
  // new Player(),
  // new Player(),
].forEach((player) => Game.instance.addPlayer(player));

ReactDOM.render(<App />, document.getElementById("main"));
