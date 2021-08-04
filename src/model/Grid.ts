import { Graphics } from './graphics';
import { Buffer } from './buffer';
import { Color, createElement, px, Rect } from './util';
import { CutLine } from './cutLine';

export enum Buffers {
  Grid = 'grid',
  Cuts = 'cuts',
}

export type Direction = -1 | 1;

export type Vector = [number, number];

const vertexKey = (h: number, v: number) => `${h}:${v}`;

const edgeKey = (fromVertexKey: string, toVertexKey: string) =>
  `${fromVertexKey}-${toVertexKey}`;

export class Grid {
  hDivisions: number;
  vDivisions: number;
  width: number = 0;
  height: number = 0;
  cellWidth: number = 0;
  cellHeight: number = 0;
  cells: Cell[][] = [];
  graphics: Graphics;
  vertexMap: Map<string, Vertex> = new Map();
  edgeMap: Map<string, Edge> = new Map();
  spritesContainer: HTMLDivElement;

  constructor(
    hDivisions: number,
    vDivisions: number,
    spritesContainer: HTMLDivElement
  ) {
    this.hDivisions = hDivisions;
    this.vDivisions = vDivisions;
    this.graphics = new Graphics();
    this.graphics.createBuffer(Buffers.Grid);
    this.graphics.createBuffer(Buffers.Cuts);
    this.spritesContainer = spritesContainer;
  }

  get minCellSize() {
    return Math.min(this.cellWidth, this.cellHeight);
  }

  init(width: number, height: number) {
    const { hDivisions, vDivisions, vertexMap, edgeMap } = this;
    this.width = width;
    this.height = height;
    const cellWidth = (this.cellWidth = Math.floor(width / hDivisions));
    const cellHeight = (this.cellHeight = Math.floor(height / vDivisions));
    this.graphics.setSize(width + 1, height + 1);

    // create vertexes
    for (let v = 0; v <= vDivisions; v += 1) {
      const y = v * cellHeight;
      for (let h = 0; h <= hDivisions; h += 1) {
        const x = h * cellWidth;
        const vertex = new Vertex(x, y);
        const key = vertexKey(h, v);
        vertexMap.set(key, vertex);
      }
    }

    // create edges
    for (let v = 0; v < vDivisions; v += 1) {
      for (let h = 0; h < hDivisions; h += 1) {
        const topLeftVertexKey = vertexKey(h, v);
        const topRightVertexKey = vertexKey(h + 1, v);
        const bottomLeftVertexKey = vertexKey(h, v + 1);
        const topLeftVertex = vertexMap.get(topLeftVertexKey)!;
        const topRightVertex = vertexMap.get(topRightVertexKey)!;
        const bottomLeftVertex = vertexMap.get(bottomLeftVertexKey)!;
        const topEdge = new Edge(this, h, v, topLeftVertex, topRightVertex);
        const leftEdge = new Edge(this, h, v, topLeftVertex, bottomLeftVertex);
        const topEdgeKey = edgeKey(topLeftVertexKey, topRightVertexKey);
        const leftEdgeKey = edgeKey(topLeftVertexKey, bottomLeftVertexKey);
        edgeMap.set(topEdgeKey, topEdge);
        edgeMap.set(leftEdgeKey, leftEdge);

        if (v === vDivisions - 1) {
          const bottomRightVertexKey = vertexKey(h + 1, v + 1);
          const bottomRightVertex = vertexMap.get(bottomRightVertexKey)!;
          const bottomEdge = new Edge(
            this,
            h,
            v,
            bottomLeftVertex,
            bottomRightVertex
          );
          const bottomEdgeKey = edgeKey(
            bottomLeftVertexKey,
            bottomRightVertexKey
          );
          edgeMap.set(bottomEdgeKey, bottomEdge);
        }
      }

      const topRightVertexKey = vertexKey(hDivisions, v);
      const bottomRightVertexKey = vertexKey(hDivisions, v + 1);
      const topRightVertex = vertexMap.get(topRightVertexKey)!;
      const bottomRightVertex = vertexMap.get(bottomRightVertexKey)!;
      const rightEdge = new Edge(
        this,
        hDivisions,
        v,
        topRightVertex,
        bottomRightVertex
      );
      const rightEdgeKey = edgeKey(topRightVertexKey, bottomRightVertexKey);
      edgeMap.set(rightEdgeKey, rightEdge);
    }

    // create cells
    for (let v = 0; v < vDivisions; v += 1) {
      const row: Cell[] = [];
      for (let h = 0; h < hDivisions; h += 1) {
        const topLeftVertexKey = vertexKey(h, v);
        const topRightVertexKey = vertexKey(h + 1, v);
        const bottomLeftVertexKey = vertexKey(h, v + 1);
        const bottomRightVertexKey = vertexKey(h + 1, v + 1);
        const topEdgeKey = edgeKey(topLeftVertexKey, topRightVertexKey);
        const leftEdgeKey = edgeKey(topLeftVertexKey, bottomLeftVertexKey);
        const rightEdgeKey = edgeKey(topRightVertexKey, bottomRightVertexKey);
        const bottomEdgeKey = edgeKey(
          bottomLeftVertexKey,
          bottomRightVertexKey
        );
        const topEdge = edgeMap.get(topEdgeKey)!;
        const leftEdge = edgeMap.get(leftEdgeKey)!;
        const rightEdge = edgeMap.get(rightEdgeKey)!;
        const bottomEdge = edgeMap.get(bottomEdgeKey)!;
        const cell = new Cell(topEdge, leftEdge, rightEdge, bottomEdge);
        row.push(cell);

        if (h > 0) {
          // link horizontal edges prev/next
          topEdge.prev = edgeMap.get(
            edgeKey(vertexKey(h - 1, v), vertexKey(h, v))
          );
          topEdge.prev!.next = topEdge;
          bottomEdge.prev = edgeMap.get(
            edgeKey(vertexKey(h - 1, v + 1), vertexKey(h, v + 1))
          );
          bottomEdge.prev!.next = bottomEdge;
        }

        if (v > 0) {
          // link vertical edges above/below
          leftEdge.above = edgeMap.get(
            edgeKey(vertexKey(h, v - 1), vertexKey(h, v))
          );
          leftEdge.above!.below = leftEdge;
          rightEdge.above = edgeMap.get(
            edgeKey(vertexKey(h + 1, v - 1), vertexKey(h + 1, v))
          );
          rightEdge.above!.below = rightEdge;
        }

        // link vertex 4? edges
        this.linkVertexToQuadEdges(h, v);
        this.linkVertexToQuadEdges(h, v + 1);
      }

      this.linkVertexToQuadEdges(this.hDivisions, v);

      this.cells.push(row);
    }

    this.linkVertexToQuadEdges(this.hDivisions, this.vDivisions);

    this.renderGrid();
  }

  linkVertexToQuadEdges(h: number, v: number) {
    const { vertexMap, edgeMap } = this;
    const vertexCenterKey = vertexKey(h, v);
    const vertexAboveKey = vertexKey(h, v - 1);
    const vertexBelowKey = vertexKey(h, v + 1);
    const vertexPrevKey = vertexKey(h - 1, v);
    const vertexNextKey = vertexKey(h + 1, v);
    const vertex = vertexMap.get(vertexCenterKey)!;
    vertex.above = edgeMap.get(edgeKey(vertexAboveKey, vertexCenterKey));
    vertex.below = edgeMap.get(edgeKey(vertexCenterKey, vertexBelowKey));
    vertex.prev = edgeMap.get(edgeKey(vertexPrevKey, vertexCenterKey));
    vertex.next = edgeMap.get(edgeKey(vertexCenterKey, vertexNextKey));
  }

  getCell(h: number, v: number) {
    if (v >= this.cells.length || v < 0 || h < 0 || h >= this.hDivisions) {
      return;
    }
    return this.cells[v][h];
  }

  renderGrid() {
    const buffer = this.graphics.getBuffer(Buffers.Grid);
    buffer.fill('green');
    buffer.batchImageDataOps(() => {
      const { hDivisions, vDivisions } = this;
      for (let v = 0; v < vDivisions; v += 1) {
        for (let h = 0; h < hDivisions; h += 1) {
          const cell = this.cells[v][h];
          cell.render(buffer);
          if (h === hDivisions - 1) {
            cell.right.render(buffer);
          }
          if (v === vDivisions - 1) {
            cell.bottom.render(buffer);
          }
        }
      }
    });
  }

  cutCells(cutLine: CutLine) {
    const { cellWidth, cellHeight } = this;
    const [x, y, w, h] = cutLine.getBounds();
    const gridHMin = x / cellWidth;
    const gridVMin = y / cellHeight;
    const gridHMax = gridHMin + w / cellWidth;
    const gridVMax = gridVMin + h / cellHeight;
    const buffer = this.graphics.getBuffer(Buffers.Grid);
    const vertexes: Set<Vertex> = new Set();
    cutLine.edges.forEach((edge) => {
      vertexes.add(edge.from);
      vertexes.add(edge.to);
    });
    const emptyCells: Set<Cell> = new Set();
    let cell: Cell | undefined;
    for (let v = gridVMin; v < gridVMax; v++) {
      let isEmpty = false;
      for (let h = gridHMin; h < gridHMax; h++) {
        cell = this.getCell(h, v);
        if (cell) {
          if (
            vertexes.has(cell.left.from) &&
            vertexes.has(cell.left.to) &&
            cell.left.isCut
          ) {
            isEmpty = !isEmpty;
          }
          if (isEmpty) {
            emptyCells.add(cell);
          }
        }
      }
      if (
        isEmpty &&
        (!vertexes.has(cell!.right.from) || !vertexes.has(cell!.right.to)) &&
        !cell!.right.isCut
      ) {
        for (let h = gridHMax; h >= gridHMin; h--) {
          cell = this.getCell(h, v);
          if (cell) {
            emptyCells.delete(cell);
          }
        }
      }
    }
    if (emptyCells.size === 0) {
      // buffer.fillRect(x, y, w, h, 'rgba(255,0,0,0.2)');
    } else {
      emptyCells.forEach((cell) => {
        cell.cut();
        // cell.render(buffer, 'rgba(0,255,0,0.5)');
      });
    }
    cutLine.uncutEdges();
    return emptyCells;
  }
}

export class Vertex {
  x: number;
  y: number;
  above?: Edge;
  below?: Edge;
  prev?: Edge;
  next?: Edge;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get hasVerticalCuts() {
    return (this.above && this.above.isCut) || (this.below && this.below.isCut);
  }

  get hasBothVerticalCuts() {
    return this.above && this.below && this.above.isCut && this.below.isCut;
  }

  get hasHorizontalCuts() {
    return (this.prev && this.prev.isCut) || (this.next && this.next.isCut);
  }

  get hasBothHorizontalCuts() {
    return this.prev && this.next && this.prev.isCut && this.next.isCut;
  }
}

export class Edge {
  grid: Grid;
  h: number;
  v: number;
  from: Vertex;
  to: Vertex;
  isCut: boolean = false;
  above?: Edge;
  below?: Edge;
  prev?: Edge;
  next?: Edge;

  constructor(grid: Grid, h: number, v: number, from: Vertex, to: Vertex) {
    this.grid = grid;
    this.h = h;
    this.v = v;
    this.from = from;
    this.to = to;
  }

  get isVertical() {
    return this.from.x === this.to.x;
  }

  get isHorizontal() {
    return this.from.y === this.to.y;
  }

  getPosition(direction: Direction, offset: number): Vector {
    if (this.isVertical) {
      if (direction === -1) {
        return [this.to.x, this.to.y - offset];
      } else {
        return [this.to.x, this.from.y + offset];
      }
    } else {
      if (direction === -1) {
        return [this.to.x - offset, this.from.y];
      } else {
        return [this.from.x + offset, this.from.y];
      }
    }
  }

  containsPosition(direction: Direction, offset: number): boolean {
    if (this.isVertical) {
      if (direction === -1) {
        return this.to.y - (this.to.y - offset) <= this.grid.cellHeight;
      } else {
        return this.from.y + offset - this.from.y <= this.grid.cellHeight;
      }
    } else {
      if (direction === -1) {
        return this.to.x - (this.to.x - offset) <= this.grid.cellWidth;
      } else {
        return this.from.x + offset - this.from.x <= this.grid.cellWidth;
      }
    }
  }

  getFromVertex(direction: Direction): Vertex {
    if (this.isVertical) {
      if (direction === -1) {
        return this.to;
      } else {
        return this.from;
      }
    } else {
      if (direction === -1) {
        return this.to;
      } else {
        return this.from;
      }
    }
  }

  getToVertex(direction: Direction): Vertex {
    if (this.isVertical) {
      if (direction === -1) {
        return this.from;
      } else {
        return this.to;
      }
    } else {
      if (direction === -1) {
        return this.from;
      } else {
        return this.to;
      }
    }
  }

  getNextEdge(direction: Direction) {
    if (this.isVertical) {
      if (direction === -1) {
        return this.above;
      } else {
        return this.below;
      }
    } else {
      if (direction === -1) {
        return this.prev;
      } else {
        return this.next;
      }
    }
  }

  getNextWrappedEdge(direction: Direction) {
    const edge = this.getNextEdge(direction);
    if (edge) {
      return edge;
    } else {
      if (this.isVertical) {
        if (direction === -1) {
          return this.grid.edgeMap.get(
            edgeKey(
              vertexKey(this.h, this.grid.hDivisions - 1),
              vertexKey(this.h, this.grid.hDivisions)
            )
          )!;
        } else {
          return this.grid.edgeMap.get(
            edgeKey(vertexKey(this.h, 0), vertexKey(this.h, 1))
          )!;
        }
      } else {
        if (direction === -1) {
          return this.grid.edgeMap.get(
            edgeKey(
              vertexKey(this.grid.hDivisions - 1, this.v),
              vertexKey(this.grid.hDivisions, this.v)
            )
          )!;
        } else {
          return this.grid.edgeMap.get(
            edgeKey(vertexKey(0, this.v), vertexKey(1, this.v))
          )!;
        }
      }
    }
  }

  getCell() {
    return this.grid.getCell(this.h, this.v);
  }

  getPrevCell() {
    return this.grid.getCell(this.h - 1, this.v);
  }

  getNextCell() {
    return this.grid.getCell(this.h + 1, this.v);
  }

  getAboveCell() {
    return this.grid.getCell(this.h, this.v - 1);
  }

  getBelowCell() {
    return this.grid.getCell(this.h, this.v + 1);
  }

  render(buffer: Buffer, color: Color = [100, 100, 100]) {
    buffer.drawStraightLine(
      this.from.x,
      this.from.y,
      this.to.x,
      this.to.y,
      color
    );
  }
}

export class Cell {
  top: Edge;
  left: Edge;
  right: Edge;
  bottom: Edge;
  isEmpty: boolean = false;
  sprite?: HTMLDivElement;

  constructor(top: Edge, left: Edge, right: Edge, bottom: Edge) {
    this.top = top;
    this.left = left;
    this.right = right;
    this.bottom = bottom;
  }

  get topLeft() {
    return this.top.from;
  }

  get topRight() {
    return this.top.to;
  }

  get bottomLeft() {
    return this.bottom.from;
  }

  get bottomRight() {
    return this.bottom.to;
  }

  get bounds(): Rect {
    const { topLeft, bottomRight, topRight } = this;
    return [
      topLeft.x,
      topLeft.y,
      topRight.x - topLeft.x,
      bottomRight.y - topRight.y,
    ];
  }

  cut() {
    this.isEmpty = true;
    const sprite = (this.sprite = createElement<HTMLDivElement>(
      'div',
      undefined,
      ['sprite', 'cell']
    ));
    const [x, y, w, h] = this.bounds;
    const grid = this.left.grid;
    sprite.style.left = px(x);
    sprite.style.top = px(y);
    sprite.style.width = px(w);
    sprite.style.height = px(h);
    grid.spritesContainer.appendChild(this.sprite);
    grid.graphics.getBuffer(Buffers.Grid).fillRect(x, y, w, h, 'black');
    setTimeout(() => {
      sprite.style.left = px(x + w / 2);
      sprite.style.top = px(y + h / 2);
      sprite.style.width = '0px';
      sprite.style.height = '0px';
      setTimeout(() => {
        sprite.parentElement!.removeChild(sprite);
      }, 2000);
    }, Math.round(Math.random() * 250));
  }

  render(buffer: Buffer, fillColor?: string) {
    if (fillColor) {
      buffer.updateImageData();
      const [x, y, width, height] = this.bounds;
      buffer.fillRect(x, y, width, height, fillColor);
      buffer.getImageData();
    }
    this.top.render(buffer);
    this.left.render(buffer);
  }
}
