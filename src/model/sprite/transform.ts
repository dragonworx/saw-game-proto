import { Node } from "./node";

export interface ITransform {
  originX: number;
  originY: number;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scaleX: number;
  scaleY: number;
}

export const defaultTransform: ITransform = {
  originX: 0,
  originY: 0,
  x: 0,
  y: 0,
  z: 0,
  width: 100,
  height: 100,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  scaleX: 1,
  scaleY: 1,
};

export class Transform extends Node {
  transform: ITransform;

  constructor(initialState: Partial<ITransform> = {}) {
    super();

    this.transform = {
      originX: initialState.originX || defaultTransform.originX,
      originY: initialState.originY || defaultTransform.originY,
      x: initialState.x || defaultTransform.x,
      y: initialState.y || defaultTransform.y,
      z: initialState.z || defaultTransform.z,
      width: initialState.width || defaultTransform.width,
      height: initialState.height || defaultTransform.height,
      rotationX: initialState.rotationX || defaultTransform.rotationX,
      rotationY: initialState.rotationY || defaultTransform.rotationY,
      rotationZ: initialState.rotationY || defaultTransform.rotationZ,
      scaleX: initialState.scaleX || defaultTransform.scaleX,
      scaleY: initialState.scaleY || defaultTransform.scaleY,
    };
  }

  // Getters ...

  get originX() {
    return this.transform.originX;
  }

  get originY() {
    return this.transform.originY;
  }

  get x() {
    return this.transform.x;
  }

  get y() {
    return this.transform.y;
  }

  get z() {
    return this.transform.z;
  }

  get width() {
    return this.transform.width;
  }

  get height() {
    return this.transform.height;
  }

  get rotationX() {
    return this.transform.rotationX;
  }

  get rotationY() {
    return this.transform.rotationY;
  }

  get rotationZ() {
    return this.transform.rotationZ;
  }

  get scaleX() {
    return this.transform.scaleX;
  }

  get scaleY() {
    return this.transform.scaleY;
  }

  get cssTransform() {
    const origin = `translateX(${
      this.width * this.originX * -1
    }px) translateY(${this.height * this.originY * -1}px)`;
    const translate = `translateX(${this.x}px) translateY(${this.y}px)`;
    const rotate = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg) rotateZ(${this.rotationZ}deg)`;
    const scale = `scaleX(${this.scaleX}) scaleY(${this.scaleY})`;
    return `${origin} ${translate} ${rotate} ${scale}`;
  }

  // Setters...

  set originX(value: number) {
    this.set(this.transform, "originX", value);
  }

  set originY(value: number) {
    this.set(this.transform, "originY", value);
  }

  set x(value: number) {
    this.set(this.transform, "x", value);
  }

  set y(value: number) {
    this.set(this.transform, "y", value);
  }

  set z(value: number) {
    this.set(this.transform, "z", value);
  }

  set width(value: number) {
    this.set(this.transform, "width", value);
  }

  set height(value: number) {
    this.set(this.transform, "height", value);
  }

  set rotationX(value: number) {
    this.set(this.transform, "rotationX", value);
  }

  set rotationY(value: number) {
    this.set(this.transform, "rotationY", value);
  }

  set rotationZ(value: number) {
    this.set(this.transform, "rotationZ", value);
  }

  set scaleX(value: number) {
    this.set(this.transform, "scaleX", value);
  }

  set scaleY(value: number) {
    this.set(this.transform, "scaleY", value);
  }

  // ---

  renderStyle() {
    return `
      ${super.renderStyle()}
      position: absolute;
      width: ${this.width}px;
      height: ${this.height}px;
      transform-style: preserve-3d;
      transform: ${this.cssTransform};
    `;
  }
}
