export interface ITimelineObject {
  update: (elapsedMs: number) => void;
}

export class Timeline {
  elements: ITimelineObject[];
  startTime: number;

  constructor() {
    this.elements = [];
    this.startTime = Date.now();
    requestAnimationFrame(this.update.bind(this));
  }

  update() {
    const elapsedMs = Date.now() - this.startTime;
    this.elements.forEach((timelineObject) => timelineObject.update(elapsedMs));
    requestAnimationFrame(this.update.bind(this));
  }

  add(timelineObject: ITimelineObject) {
    this.elements.push(timelineObject);
  }
}
