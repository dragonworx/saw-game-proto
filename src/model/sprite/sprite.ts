import { Transform, ITransform } from "./transform";
import { ITimelineObject } from "./timeline";

export type onUpdateHandler = (sprite: Sprite, elapsedMs: number) => void;
export type onMouseHandler = (sprite: Sprite, event: MouseEvent) => void;

export interface ISprite {
  id: string;
  alpha: number;
  fillColor: string;
  onUpdate?: onUpdateHandler;
  onMouseOver?: onMouseHandler;
}

export const defaultSprite: ISprite = {
  id: "unset",
  alpha: 1,
  fillColor: "blue",
};

export class Sprite extends Transform implements ISprite, ITimelineObject {
  sprite: ISprite;
  debugBounds: HTMLDivElement;

  constructor(initialState: Partial<ISprite & ITransform> = {}) {
    super(initialState);

    this.sprite = {
      id: initialState.id || defaultSprite.id,
      alpha: initialState.alpha || defaultSprite.alpha,
      fillColor: initialState.fillColor || defaultSprite.fillColor,
      onUpdate: initialState.onUpdate || defaultSprite.onUpdate,
      onMouseOver: initialState.onMouseOver || defaultSprite.onMouseOver,
    };

    this.element.setAttribute("data-id", this.sprite.id);

    if (this.sprite.onMouseOver) {
      this.element.addEventListener("mouseover", this._onMouseOver);
    }

    this.debugBounds = document.createElement("div");
    const parentElement = this.node.element.parentElement;
    parentElement && parentElement.appendChild(this.debugBounds);
  }

  private _onMouseOver = (event: MouseEvent) => {
    if (this.onMouseOver) {
      this.onMouseOver(this, event);
    }
  };

  // Getters ...

  get id() {
    return this.sprite.id;
  }

  get alpha() {
    return this.sprite.alpha;
  }

  get fillColor() {
    return this.sprite.fillColor;
  }

  get onUpdate(): onUpdateHandler | undefined {
    return this.sprite.onUpdate;
  }

  get onMouseOver(): onMouseHandler | undefined {
    return this.sprite.onMouseOver;
  }

  // Setters...

  set id(value: string) {
    this.set(this.sprite, "id", value);
  }

  set alpha(value: number) {
    this.set(this.sprite, "alpha", value);
  }

  set fillColor(value: string) {
    this.set(this.sprite, "fillColor", value);
  }

  set onUpdate(value: onUpdateHandler | undefined) {
    this.set(this.sprite, "onUpdate", value);
  }

  set onMouseOver(value: onMouseHandler | undefined) {
    this.set(this.sprite, "onMouseOver", value);
  }

  // ---

  // render() {
  //   super.render();
  //   const bounds = this.node.element.getBoundingClientRect();
  // }

  renderStyle() {
    return `
      ${super.renderStyle()}
      opacity: ${this.sprite.alpha};
      background-color: ${this.sprite.fillColor};
    `;
  }

  event(name: string) {}

  update(elapsedMs: number) {
    this.onUpdate && this.onUpdate(this, elapsedMs);
  }
}
