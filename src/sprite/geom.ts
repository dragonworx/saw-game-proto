export function radians(deg: number) {
  return deg * (Math.PI / 180);
}

export function degrees(rad: number) {
  return rad * (180 / Math.PI);
}

export function angle(x1: number, y1: number, x2: number, y2: number) {
  let deg = degrees(Math.atan2(y2 - y1, x2 - x1));
  if (deg < 0) {
    deg = 180 + (180 - Math.abs(deg));
  }
  return deg;
}

export function length(x1: number, y1: number, x2: number, y2: number) {
  const x = Math.abs(x2 - x1);
  const y = Math.abs(y2 - y1);
  return Math.sqrt(y * y + x * x);
}

export function polarPoint(deg: number, length: number) {
  const x = length * Math.cos(radians(deg));
  const y = length * Math.sin(radians(deg));
  return { x, y };
}
