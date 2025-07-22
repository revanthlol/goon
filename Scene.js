export default class Scene {
  constructor() {
    this.lastTime = 0;
    this.elapsedTime = 0;
    this.element = document.createElement("canvas");
    this.context = this.element.getContext("2d");
    this._size = { width: 1, height: 1 };
  }

  main() {
    const now = Date.now();
    const dt = (now - this.lastTime) / 1000.0;
    this.update(dt);
    this.render();
    this.lastTime = now;
    requestAnimationFrame(this.main.bind(this));
  }

  update(dt) {}
  render() {}
  sizeDidChange(size) {}

  get size() {
    return this._size;
  }
  
  set size(size) {
    const el = this.element;
    el.width = size.width * 0.5;
    el.height = size.height * 0.5;
    el.style.width = size.width + "px";
    el.style.height = size.height + "px";
    this.context.scale(0.5, 0.5);
    this._size = { width: size.width, height: size.height };
    this.sizeDidChange(this._size);
  }
}