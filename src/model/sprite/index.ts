import { Stage } from "./stage";
import { Sprite } from "./sprite";

const stage = new Stage(document.getElementById("main")!);

const sprite1 = new Sprite({
  id: "sprite1",
  originX: 0.5,
  originY: 0.5,
  scaleX: 2,
  onUpdate: (sprite) => (sprite.rotationZ += 0.1),
});

const sprite2 = new Sprite({
  id: "sprite2",
  x: 200,
  onMouseOver(sprite, event) {
    console.log(event.clientX);
  },
});

const sprite3 = new Sprite({
  id: "sprite3",
  originX: 0.5,
  originY: 0.5,
  fillColor: "red",
  scaleX: 2,
  onUpdate(sprite) {
    sprite.x = stage.mouseX;
    // sprite.y = stage.mouseY;
    sprite.rotationZ += 0.5;
    sprite.rotationX += 1.5;
  },
});

setInterval(() => {
  sprite3.alpha = Math.random();
}, 3000);

stage.addSprite(sprite1, sprite3);
sprite1.addChild(sprite2);

// debug
const win = window as any;
win.stage = stage;
