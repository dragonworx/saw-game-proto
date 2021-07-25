export class GridSquare {
  id: string;
  x: number;
  y: number;
  left?: GridSquare;
  right?: GridSquare;
  top?: GridSquare;
  bottom?: GridSquare;

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
  }
}
