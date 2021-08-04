export type Point = [number, number];
export type Rect = [number, number, number, number];

export type Color = [number, number, number, number?];

export function createElement<T extends HTMLElement>(
  nodeType: string,
  id?: string,
  cssClasses?: string[]
): T {
  const element = document.createElement(nodeType) as T;
  if (id) {
    element.setAttribute('id', id);
  }
  if (cssClasses) {
    element.classList.add(...cssClasses);
  }
  return element;
}

export function px(value: number) {
  return `${value}px`;
}

export function randomColor(withAlpha: boolean = false): Color {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return withAlpha ? [r, g, b, Math.round(Math.random() * 255)] : [r, g, b];
}

export function randomRgb() {
  return rgb(randomColor());
}

export function rgb(color: Color) {
  return `rgb(${color[0]},${color[1]},${color[2]})`;
}

export function throttled(fn: Function, delay: number) {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
}

export function randomNoise(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha: number
) {
  x = x || 0;
  y = y || 0;
  width = width || canvas.width;
  height = height || canvas.height;
  alpha = alpha || 255;
  var g = canvas.getContext('2d')!,
    imageData = g.getImageData(x, y, width, height),
    random = Math.random,
    pixels = imageData.data,
    n = pixels.length,
    i = 0;
  while (i < n) {
    pixels[i++] = pixels[i++] = pixels[i++] = (random() * 256) | 0;
    pixels[i++] = alpha;
  }
  g.putImageData(imageData, x, y);
  return canvas;
}

export function perlin_noise(canvas: HTMLCanvasElement) {
  var canvas_ctx = canvas.getContext('2d')!,
    offscreen = document.createElement('canvas'),
    offscreen_ctx = offscreen.getContext('2d')!,
    saved_alpha = canvas_ctx.globalAlpha;

  /* Fill the offscreen buffer with random noise. */
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;

  var offscreen_id = offscreen_ctx.getImageData(
      0,
      0,
      offscreen.width,
      offscreen.height
    ),
    offscreen_pixels = offscreen_id.data;

  for (var i = 0; i < offscreen_pixels.length; i += 4) {
    offscreen_pixels[i] =
      offscreen_pixels[i + 1] =
      offscreen_pixels[i + 2] =
        Math.floor(Math.random() * 256);
    offscreen_pixels[i + 3] = 255;
  }

  offscreen_ctx.putImageData(offscreen_id, 0, 0);

  /* Scale random iterations onto the canvas to generate Perlin noise. */
  for (var size = 4; size <= offscreen.width; size *= 2) {
    var x = Math.floor(Math.random() * (offscreen.width - size)),
      y = Math.floor(Math.random() * (offscreen.height - size));

    canvas_ctx.globalAlpha = 4 / size;
    canvas_ctx.drawImage(
      offscreen,
      x,
      y,
      size,
      size,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  canvas_ctx.globalAlpha = saved_alpha;
}
