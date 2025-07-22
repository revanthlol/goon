import Sprite from './Sprite.js';
import Scene from './Scene.js';
import * as Random from './Random.js';
import './RoundedRect.js';

export default class BonkScene extends Scene {
  constructor() {
    super();
    this.backgroundColor = "#333";
    this.containerColor = "#222";
    this.entities = [];
    this.hue = 0; // NEW: Property to track the rainbow animation state

    const image = new Image();
    
    image.onload = () => {
      const spriteSheet = new Sprite(image, Sprite.GeometryHorizontalLinear(33, 29, 4));
      this.sprites = { ditto: spriteSheet };
      this.main(); // Starts the animation loop
    };
    
    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAAdAgMAAAAWQyy/AAAADFBMVEX///+4YOA4ODj4+PhASPNeAAAAAXRSTlMAQObYZgAAAStJREFUeF6l08FqhEAMBuBhbk6fYyj6Pgmul3pZEN9hWV8i9FgvC3X6PELpe2zP9Y/pyCLLFprLoP83STzo/lv+/ZEoGGwMw10RacmePmML4PfOjyqev6WGKDs/Kth40QiEXInxLPzxle+WHUS8kgoi6vU8zzaobIQB31R4QrU4T9RVKl5ngpheaBP1KlmWLlU4z0iCJioORKxCmzm5nDSJAOx0jxthdEBwzOLIkJyFIEGgQpvVqxSMhVRxQKCiEYhozQtbPV/Fmx6iJE5ErYkWgi8mlOYkEiVZxQRpglUojSZB9wJUTDoxkTeMN4J3ot0JT79CTMifRUmUEtV5803EJcD3+5ScS+MmML+feHBhCcKSWOVvw9s07H+LTdwvL/1Fp9yvaggJUx/WD0e0wREEScedAAAAAElFTkSuQmCC";
  }

  createEntity() {
    const sprite = this.sprites.ditto;
    const frame = sprite.frames[0];
    const direction = Random.integerValue(0, 1);
    const scale = Random.integerValue(4, 16);
    const opacity = Random.floatValue(0.1, 1);
    const speed = Random.integerValue(400, 1000) * (direction ? 1 : -1);
    
    const size = {
        width: frame.width * scale,
        height: frame.height * scale
    };

    return {
        sprite: sprite,
        animationFrameDuration: 0.085,
        animationFrame: 0,
        time: 0,
        speed: { x: speed, y: 0 },
        size: size,
        origin: {
            x: direction ? -size.width : this.size.width,
            y: Random.integerValue(0, this.size.height - size.height)
        },
        opacity: opacity,
        intrinsicSize: { width: frame.width, height: frame.height }
    };
  }

  render() {
    const ctx = this.context;
    const { width, height } = this.size;
    
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw Jail Bars
    ctx.fillStyle = "black";
    for(let j = 0; j < width; j += 50) {
      ctx.fillRect(j, 0, 10, height);
    }
    
    // ----- MODIFIED: Draw Main Text with Animated Gradient -----
    ctx.globalAlpha = 1;
    
    // Set font properties
    const fontSize = width / 15;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.lineWidth = 10;
    
    // Text and positions
    const line1 = "GO TO";
    const line2 = "HORNY JAIL";
    const textX = width / 2;
    const y1 = height / 2 - fontSize * 0.2; // Adjusted position slightly for centering
    const y2 = y1 + fontSize * 1.1;

    // Create the animated rainbow gradient
    const textWidth = Math.max(ctx.measureText(line1).width, ctx.measureText(line2).width);
    const gradient = ctx.createLinearGradient(textX - textWidth / 2, 0, textX + textWidth / 2, 0);

    const hueOffset = 40; // Spacing between colors in the rainbow
    gradient.addColorStop(0,       `hsl(${this.hue + (hueOffset * 0)}, 100%, 60%)`);
    gradient.addColorStop(0.2,     `hsl(${this.hue + (hueOffset * 1)}, 100%, 60%)`);
    gradient.addColorStop(0.4,     `hsl(${this.hue + (hueOffset * 2)}, 100%, 60%)`);
    gradient.addColorStop(0.6,     `hsl(${this.hue + (hueOffset * 3)}, 100%, 60%)`);
    gradient.addColorStop(0.8,     `hsl(${this.hue + (hueOffset * 4)}, 100%, 60%)`);
    gradient.addColorStop(1,       `hsl(${this.hue + (hueOffset * 5)}, 100%, 60%)`);
    
    // Apply the gradient outline and white fill
    ctx.strokeStyle = gradient;
    ctx.fillStyle = "white";

    // Draw first line
    ctx.strokeText(line1, textX, y1);
    ctx.fillText(line1, textX, y1);
    
    // Draw second line
    ctx.strokeText(line2, textX, y2);
    ctx.fillText(line2, textX, y2);
    // ----- End of Modified Section -----

    // Draw inmate entities
    for(const entity of this.entities) {
      ctx.globalAlpha = entity.opacity;
      entity.sprite.drawFrame(ctx, entity.animationFrame, entity.origin.x, entity.origin.y, entity.size.width, entity.size.height);
    }
  }

  update(dt) {
    // NEW: Animate the hue value for the rainbow gradient
    const hueSpeed = 60; // Degrees to shift per second
    this.hue = (this.hue + hueSpeed * dt) % 360; // Increment and wrap around 360
    
    // Original update logic below
    this.elapsedTime += dt;
    if (this.elapsedTime >= 0.4) {
      this.elapsedTime = 0;
      this.entities.push(this.createEntity());
    }

    let entitiesToRemove = [];
    for (let i = 0; i < this.entities.length; i++) {
        const entity = this.entities[i];
        entity.time += dt;

        if (entity.time >= entity.animationFrameDuration) {
            let nextFrame = entity.animationFrame + 1;
            entity.time = 0;
            entity.animationFrame = nextFrame < entity.sprite.frames.length ? nextFrame : 0;
        }
        
        if (entity.speed.x !== 0) {
            entity.origin.x += Math.floor(entity.speed.x * dt);
        }

        if (entity.origin.x > this.size.width || entity.origin.x <= -entity.size.width) {
            entitiesToRemove.push(i);
        }
    }

    for (const index of entitiesToRemove.reverse()) {
      this.entities.splice(index, 1);
    }
  }
}