export type Point = [number, number];

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
