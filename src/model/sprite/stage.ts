import { Timeline } from "./timeline";
import { Sprite } from "./sprite";

export class Stage {
  private spritesById: Map<string, Sprite>;
  containerElement: HTMLElement;
  timeline: Timeline;
  mouseX: number;
  mouseY: number;
  width: number;
  height: number;

  constructor(containerElement: HTMLElement) {
    this.spritesById = new Map();
    this.containerElement = containerElement;
    this.timeline = new Timeline();
    this.mouseX = 0;
    this.mouseY = 0;
    this.width = containerElement.offsetWidth;
    this.height = containerElement.offsetHeight;

    window.addEventListener("mousemove", (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    containerElement.addEventListener("resize", (e) => {
      this.width = containerElement.offsetWidth;
      this.height = containerElement.offsetHeight;
    });
  }

  addSprite(...sprites: Sprite[]) {
    sprites.forEach((sprite) => {
      const { id, element } = sprite;
      const { spritesById, timeline, containerElement } = this;
      if (this.spritesById.has(id)) {
        throw new Error(`Sprite with id "${id}" already exists`);
      }
      timeline.add(sprite);
      containerElement.appendChild(element);
      spritesById.set(id, sprite);
      sprite.render();
    });
  }

  sprites() {
    return this.timeline.elements;
  }

  sprite(id: string) {
    const sprite = this.spritesById.get(id);
    if (!sprite) {
      throw new Error(`Sprite with id "${id}" not found`);
    }
    return sprite!;
  }
}
