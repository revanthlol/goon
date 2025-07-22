export default class Sprite {
  constructor(image, frames) {
    const { width, height } = image;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    this.canvas = canvas;
    this.context = context;
    this.frames = frames;
  }
  
  drawFrame(context, frameName, x, y, w, h) {
    const frame = this.frames[frameName];
    const { x: sx, y: sy, width: sw, height: sh } = frame;
    x = x | 0;
    y = y | 0;
    w = w | sw;
    h = h | sh;
    context.drawImage(this.canvas, sx, sy, sw, sh, x, y, w, h);
  }

  static GeometryHorizontalLinear(frameWidth, frameHeight, frameCount) {
    const frames = [];
    for(let i = 0; i < frameCount; i += 1) {
      const frame = { x: frameWidth * i, y: 0, width: frameWidth, height: frameHeight };
      frames.push(frame);
    }
    return frames;
  }
}