import { EventEmitter } from "eventemitter3";
import { randomRgb } from "../util";

export type Direction = "vertical" | "horizontal";

export interface CutInfo {
  vector: number;
  length: number;
  color: string;
}

export class Segment extends EventEmitter {
  direction: Direction;
  cuts: Map<number, CutInfo> = new Map();

  constructor(direction: Direction) {
    super();
    this.direction = direction;
  }

  getCutForGridIndex(gridIndex: number) {
    const { cuts } = this;
    if (cuts.has(gridIndex)) {
      return cuts.get(gridIndex);
    }
    for (let [index, cutInfo] of cuts) {
      if (gridIndex >= index && gridIndex <= index + cutInfo.length) {
        return cutInfo;
      }
    }
  }

  beginCut(gridIndex: number, vector: number) {
    const existingCut = this.getCutForGridIndex(gridIndex - 1);
    if (existingCut) {
      existingCut.length += 1;
      return;
    }
    this.cuts.set(gridIndex, {
      length: 1,
      color: randomRgb(),
      vector,
    });
  }
}
