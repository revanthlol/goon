import Sprite from './Sprite.js';
import Scene from './Scene.js';
import * as Random from './Random.js';
import './RoundedRect.js';

export default class BonkScene extends Scene {
  constructor() {
    super();
    // Unchanged core properties
    this.defaultBackgroundColor = "#333";
    this.beatColor = null;
    this.entities = [];
    this.hue = 0;
    this.animationState = "textVisible";
    this.barsAnimationProgress = 0;
    this.animationTimer = 0.2;
    this.shakeDuration = 0; // For the overall screen shake
    this.shakeIntensity = 0;
    
    // --- MODIFIED & SIMPLIFIED PROPERTIES ---
    this.textEntities = [];
    this.textIsSetup = false;
    this.audioAnalyser = null;
    this.frequencyData = null;
    this.lastBeat = 0;
    
    this.BEAT_THRESHOLD = 200;
    this.BEAT_COOLDOWN = 0.15;
    this.SHAKE_INTENSITY = 15; // How much the letters should shake
  }
  
  // (setAudioAnalyser, createEntity, startScene are unchanged and omitted for clarity)
   setAudioAnalyser(analyser) {
        this.audioAnalyser = analyser;
        this.frequencyData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
    }
     createEntity() {
        const sprite = this.sprites.ditto;
        const frame = sprite.frames[0];
        const direction = Random.integerValue(0, 1);
        const scale = Random.integerValue(4, 16);
        const opacity = Random.floatValue(0.1, 1);
        const speed = Random.integerValue(400, 1000) * (direction ? 1 : -1);
        const size = { width: frame.width * scale, height: frame.height * scale };
        return { sprite, animationFrameDuration: 0.085, animationFrame: 0, time: 0, speed: { x: speed, y: 0 }, size, origin: { x: direction ? -size.width : this.size.width, y: Random.integerValue(0, this.size.height - size.height) }, opacity, intrinsicSize: { width: frame.width, height: frame.height }, beatScale: 1.0 };
    }
  
    startScene() {
    const image = new Image();
    image.onload = () => {
      const spriteSheet = new Sprite(image, Sprite.GeometryHorizontalLinear(33, 29, 4));
      this.sprites = { ditto: spriteSheet };
      this.main();
    };
    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAAdAgMAAAAWQyy/AAAADFBMVEX///+4YOA4ODj4+PhASPNeAAAAAXRSTlMAQObYZgAAAStJREFUeF6l08FqhEAMBuBhbk6fYyj6Pgmul3pZEN9hWV8i9FgvC3X6PELpe2zP9Y/pyCLLFprLoP83STzo/lv+/ZEoGGwMw10RacmePmML4PfOjyqev6WGKDs/Kth40QiEXInxLPzxle+WHUS8kgoi6vU8zzaobIQB31R4QrU4T9RVKl5ngpheaBP1KlmWLlU4z0iCJioORKxCmzm5nDSJAOx0jxthdEBwzOLIkJyFIEGgQpvVqxSMhVRxQKCiEYhozQtbPV/Fmx6iJE5ErYkWgi8mlOYkEiVZxQRpglUojSZB9wJUTDoxkTeMN4J3ot0JT79CTMifRUmUEtV5803EJcD3+5ScS+MmML+feHBhCcKSWOVvw9s07H+LTdwvL/1Fp9yvaggJUx/WD0e0wREEScedAAAAAElFTkSuQmCC";
    }

  // --- REWRITTEN TEXT LOGIC ---

  // Sets up the letters, now with much simpler properties
  setupTextEntities() {
    this.textEntities = [];
    const ctx = this.context;
    const { width, height } = this.size;
    const fontSize = width / 17;
    ctx.font = `bold ${fontSize}px sans-serif`;
    
    const lines = ["GO TO HORNY JAIL", "LMAO XD"];
    const yOffsets = [height / 2 - fontSize * 0.7, height / 2 + fontSize * 0.5];
    
    lines.forEach((line, lineIndex) => {
      const textWidth = ctx.measureText(line).width;
      let currentX = (width - textWidth) / 2;
      
      for (const char of line) {
        if(char !== ' ') {
          this.textEntities.push({
            char: char,
            initialX: currentX, // The "home" position
            initialY: yOffsets[lineIndex],
            shakeEnergy: 0, // NEW: The only physics property needed
          });
        }
        currentX += ctx.measureText(char).width;
      }
    });
    this.textIsSetup = true;
  }
  
  // Applies shake energy on beat
  triggerTextShake() {
    for (const letter of this.textEntities) {
      letter.shakeEnergy = this.SHAKE_INTENSITY;
    }
  }

  render() {
    const ctx = this.context;
    const { width, height } = this.size;
    
    ctx.save();
    if (this.shakeDuration > 0) ctx.translate((Math.random() - 0.5) * 2 * this.shakeIntensity, (Math.random() - 0.5) * 2 * this.shakeIntensity);
    
    // Draw background and disco effect
    ctx.fillStyle = this.defaultBackgroundColor;
    ctx.fillRect(0, 0, width, height);
    if(this.beatColor) {
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.7);
      gradient.addColorStop(0, this.beatColor);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    // Render inmates & bars... (unchanged)
        if (this.animationState === "fullyRunning") {
        for(const entity of this.entities) {
             ctx.save();
            const { x, y } = entity.origin;
            const { width: w, height: h } = entity.size;
            const scale = entity.beatScale;
            ctx.translate(x + w/2, y + h/2);
            ctx.scale(scale, scale);
            ctx.translate(-(x + w/2), -(y + h/2));
            ctx.globalAlpha = entity.opacity;
            entity.sprite.drawFrame(ctx, entity.animationFrame, x, y, w, h);
            ctx.restore();
        }
    }

    if (this.animationState === "barsAnimating" || this.animationState === "fullyRunning") {
      ctx.fillStyle = "black";
      for(let j = 0; j < width; j += 50) {
        ctx.fillRect(j, 0, 10, height * this.barsAnimationProgress);
      }
    }
    
    
    // --- REWRITTEN TEXT RENDER ---
    const fontSize = width / 17;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.lineWidth = 10;
    
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    for(let i=0; i<=1; i+=0.2) gradient.addColorStop(i, `hsl(${this.hue + (40*i*5)}, 100%, 60%)`);
    ctx.strokeStyle = gradient;
    ctx.fillStyle = "white";

    for (const letter of this.textEntities) {
      let x = letter.initialX;
      let y = letter.initialY;
      
      // If there's shake energy, apply a TEMPORARY offset
      if (letter.shakeEnergy > 0) {
        x += (Math.random() - 0.5) * letter.shakeEnergy;
        y += (Math.random() - 0.5) * letter.shakeEnergy;
      }
      
      ctx.strokeText(letter.char, x, y);
      ctx.fillText(letter.char, x, y);
    }

    ctx.restore();
  }

  update(dt) {
    if (this.animationState === 'fullyRunning' && !this.textIsSetup) this.setupTextEntities();
    
    // Beat detection logic...
    if (this.audioAnalyser && this.animationState === 'fullyRunning') {
        this.audioAnalyser.getByteFrequencyData(this.frequencyData);
        const bassLevel = (this.frequencyData[1] + this.frequencyData[2] + this.frequencyData[3]) / 3;
        this.lastBeat += dt;
        
        if (bassLevel > this.BEAT_THRESHOLD && this.lastBeat > this.BEAT_COOLDOWN) {
            this.lastBeat = 0;
            this.beatColor = `hsl(${Random.integerValue(0, 360)}, 90%, 60%)`;
            for (const entity of this.entities) entity.beatScale = 1.3;
            this.triggerTextShake(); // Trigger the jiggle
        } else if (this.lastBeat > 0.1) {
            this.beatColor = null;
        }
        
        for (const entity of this.entities) if (entity.beatScale > 1.0) entity.beatScale -= 2.0 * dt;
    }
    
    // --- NEW: Decay the shake energy for each letter ---
    if (this.textIsSetup) {
      for (const letter of this.textEntities) {
        if (letter.shakeEnergy > 0) {
          letter.shakeEnergy *= 0.88; // Rapidly decay the shake
          if (letter.shakeEnergy < 0.5) letter.shakeEnergy = 0;
        }
      }
    }
    
    // Unchanged logic for screen shake, state changes etc...
    this.hue = (this.hue + 60 * dt) % 360;
    if (this.shakeDuration > 0) this.shakeDuration -= dt, this.shakeIntensity *= 0.9;
    switch(this.animationState) {
          case "textVisible":
        this.animationTimer -= dt;
        if (this.animationTimer <= 0) {
          this.animationState = "barsAnimating";
        }
        break;
      
      case "barsAnimating":
        this.barsAnimationProgress += 4.0 * dt;
        if (this.barsAnimationProgress >= 1) {
          this.barsAnimationProgress = 1;
          this.animationState = "fullyRunning";
          this.shakeDuration = 0.4;
          this.shakeIntensity = 20;
          this.triggerTextShake()
        }
        break;

      case "fullyRunning":
        this.elapsedTime = (this.elapsedTime || 0) + dt;
        if (this.elapsedTime >= 0.4) {
          this.elapsedTime = 0;
          if (this.sprites && this.sprites.ditto) this.entities.push(this.createEntity());
        }
        
        let entitiesToRemove = [];
        for (let i = 0; i < this.entities.length; i++) {
          const entity = this.entities[i];
          entity.time += dt;
          if (entity.time >= entity.animationFrameDuration) {
              entity.time = 0;
              entity.animationFrame = (entity.animationFrame + 1) % entity.sprite.frames.length;
          }
          entity.origin.x += Math.floor(entity.speed.x * dt);
          if (entity.origin.x > this.size.width || entity.origin.x <= -entity.size.width) {
              entitiesToRemove.push(i);
          }
        }
        for (const index of entitiesToRemove.reverse()) {
          this.entities.splice(index, 1);
        }
        break;
    }
  }
}