import Polygon from 'polygon';
import { Direction, Edge, Vertex } from './grid';
import { Buffer } from './buffer';
import { Color, randomColor } from './util';

export class CutLine {
  edges: Edge[] = [];
  color: Color;

  constructor() {
    this.color = randomColor();
  }

  get last() {
    return this.edges[this.edges.length - 1];
  }

  clear() {
    this.edges = [];
  }

  addEdge(edge: Edge) {
    edge.isCut = true;
    this.edges.push(edge);
  }

  getIntersectionPolygon(vertex: Vertex) {
    const vertexes = this.edges.map((edge) => edge.to);
    const index = vertexes.findIndex((vert) => vert === vertex);
    const subVertexes = vertexes.slice(index).map((vert) => [vert.x, vert.y]);
    return new Polygon(subVertexes);
  }

  render(buffer: Buffer) {
    this.edges.forEach((edge) => edge.render(buffer, this.color));
  }

  renderLast(buffer: Buffer) {
    this.last.render(buffer, this.color);
  }

  renderCurrentPosition(buffer: Buffer, direction: Direction, offset: number) {
    const edge = this.last;
    const [x, y] = edge.getPosition(direction, offset);
    if (edge.isVertical) {
      buffer.drawVerticalLine(
        edge.getFromVertex(direction).y,
        y,
        x,
        this.color
      );
    } else {
      buffer.drawHorizontalLine(
        edge.getFromVertex(direction).x,
        x,
        y,
        this.color
      );
    }
  }
}
