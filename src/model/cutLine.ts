import Polygon from 'polygon';
import { Direction, Edge, Vertex } from './grid';
import { Buffer } from './buffer';
import { Color, randomColor, Rect } from './util';

export class CutLine {
  edges: Edge[] = [];

  clear() {
    this.edges = [];
  }

  addEdge(edge: Edge) {
    edge.isCut = true;
    this.edges.push(edge);
  }

  getIntersectionPolygon(vertex: Vertex) {
    const vertexes: Set<Vertex> = new Set();
    this.edges.forEach((edge) => {
      vertexes.add(edge.to);
      vertexes.add(edge.from);
    });
    const array = Array.from(vertexes);
    const index = array.findIndex((vert) => vert === vertex);
    const subVertexes = array.slice(index).map((vert) => [vert.x, vert.y]);
    return new Polygon(subVertexes);
  }

  getPolygon() {
    const vertexes: Set<Vertex> = new Set();
    this.edges.forEach((edge) => {
      vertexes.add(edge.to);
      vertexes.add(edge.from);
    });
    const array = Array.from(vertexes).map((vert) => [vert.x, vert.y]);
    return new Polygon(array);
  }

  uncutEdges() {
    this.edges.forEach((edge) => (edge.isCut = false));
  }

  getBounds(): Rect {
    let xMin: number = Number.MAX_VALUE;
    let yMin: number = Number.MAX_VALUE;
    let xMax: number = Number.MIN_VALUE;
    let yMax: number = Number.MIN_VALUE;
    this.edges.forEach((edge) => {
      xMin = Math.min(xMin, edge.from.x);
      xMin = Math.min(xMin, edge.to.x);
      yMin = Math.min(yMin, edge.from.y);
      yMin = Math.min(yMin, edge.to.y);
      xMax = Math.max(xMax, edge.from.x);
      xMax = Math.max(xMax, edge.to.x);
      yMax = Math.max(yMax, edge.from.y);
      yMax = Math.max(yMax, edge.to.y);
    });
    return [xMin, yMin, xMax - xMin, yMax - yMin];
  }

  render(buffer: Buffer, color: Color) {
    this.edges.forEach((edge) => edge.render(buffer, color));
  }
}
