import { Point } from './util';
import { Buffer } from './buffer';

export class CutLine {
  points: Point[] = [];

  constructor() {}

  addPoint(x: number, y: number) {
    this.points.push([x, y]);
  }

  renderPoints(buffer: Buffer) {
    this.points.forEach(([x, y]) => buffer.drawPoint(x, y, 'yellow', 6));
  }

  renderLines(buffer: Buffer) {
    const { points } = this;

    points.reduce((lastPoint, point) => {
      buffer.drawStraightLine(
        lastPoint[0],
        lastPoint[1],
        point[0],
        point[1],
        [255, 0, 0]
      );
      return point;
    }, points[0]);

    buffer.updateImageData();
  }

  getIntersectionPoint(x: number, y: number) {
    const { points } = this;
    const index = points.findIndex((point) => point[0] === x && point[1] === y);
    return points.slice(index);
  }
}
