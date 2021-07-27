export const scanlinePoly = (ctx, lines, color) => {
  const b = lines.getBounds();
  var x, y, xx;
  ctx.fillStyle = color;
  b.left = Math.floor(b.left);
  b.top = Math.floor(b.top);
  for (y = b.top; y <= b.bottom; y++) {
    const ly = lines.getLinesAtY(y + 0.5).sortLeftToRightAtY(y + 0.5);
    x = b.left - 1;
    while (x <= b.right) {
      const nx1 = ly.nextLineFromX(x);
      if (nx1 !== undefined) {
        const nx2 = ly.nextLineFromX(nx1);
        if (nx2 !== undefined) {
          const xS = Math.floor(nx1);
          const xE = Math.floor(nx2);
          for (xx = xS; xx < xE; xx++) {
            ctx.fillRect(xx, y, 1, 1);
          }
          x = nx2;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }
};

export function createLines(linesArray = []) {
  return Object.assign(linesArray, {
    addLine(l) {
      this.push(l);
    },
    getLinesAtY(y) {
      return createLines(this.filter((l) => atLineLevelY(y, l)));
    },
    sortLeftToRightAtY(y) {
      for (const l of this) {
        l.dist = l.p1.x + l.slope * (y - l.p1.y);
      }
      this.sort((a, b) => a.dist - b.dist);
      return this;
    },
    nextLineFromX(x) {
      // only when sorted
      const line = this.find((l) => l.dist > x);
      return line ? line.dist : undefined;
    },
    getBounds() {
      var top = Infinity,
        left = Infinity;
      var right = -Infinity,
        bottom = -Infinity;
      for (const l of this) {
        top = Math.min(top, l.p1.y, l.p2.y);
        left = Math.min(left, l.p1.x, l.p2.x);
        right = Math.max(right, l.p1.x, l.p2.x);
        bottom = Math.max(bottom, l.p1.y, l.p2.y);
      }
      return { top, left, right, bottom };
    },
  });
}

// const createStar = (x, y, r1, r2, points) => {
//   var i = 0,
//     pFirst,
//     p1,
//     p2;
//   const lines = createLines();
//   while (i < points * 2) {
//     const r = i % 2 ? r1 : r2;
//     const ang = (i / (points * 2)) * Math.PI * 2;
//     p2 = P2(Math.cos(ang) * r + x, Math.sin(ang) * r + y);
//     if (pFirst === undefined) {
//       pFirst = p2;
//     }
//     if (p1 !== undefined) {
//       lines.addLine(L2(p1, p2));
//     }
//     p1 = p2;
//     i++;
//   }
//   lines.addLine(L2(p2, pFirst));
//   return lines;
// };

export const createPolygon = (points) => {
  const lines = createLines();
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    lines.addLine(L2(P2(p1.x, p1.y), P2(p2.x, p2.y)));
  }
  return lines;
};

const P2 = (x = 0, y = 0) => ({ x, y });

const L2 = (p1 = P2(), p2 = P2()) => ({
  p1,
  p2,
  slope: (p2.x - p1.x) / (p2.y - p1.y),
});

const atLineLevelY = (y, l) =>
  (l.p1.y < l.p2.y && y >= l.p1.y && y <= l.p2.y) ||
  (y >= l.p2.y && y <= l.p1.y);

// const star = createStar(100, 90, 90, 40, 10);
// scanlinePoly(star, "#F00");
