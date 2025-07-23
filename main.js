import BonkScene from './BonkScene.js';

class MainController {
  constructor(container) {
    this.container = container;
    const scene = new BonkScene();
    scene.element.style.display = "none";
    container.appendChild(scene.element);
    window.addEventListener("resize", this.handleResize.bind(this));
    this.scene = scene;
    this.handleResize();

    const loadingElement = document.createElement("span");
    loadingElement.textContent = "Verifying...";
    const audioPlayer = document.getElementsByTagName("audio")[0];

    // --- NEW: Web Audio API Setup ---
    let audioContext, analyser;
    const setupAudio = () => {
        // Create audio context only once
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaElementSource(audioPlayer);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 64; // Low resolution is fine for this
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            // Pass the analyser to the scene
            scene.setAudioAnalyser(analyser);
        }
    };
    // --- End of New Section ---

    audioPlayer.addEventListener("play", () => {
      // Setup audio on first play
      setupAudio();

      loadingElement.parentNode.removeChild(loadingElement);
      scene.element.style.display = "block";
      scene.startScene();
      document.title = "BONK!";
    });

    const button = document.createElement("button");
    button.textContent = "I am 18+ and wish to enter 🌶️💦👀";
    button.addEventListener("click", () => {
      // On some browsers, AudioContext must be started after a user action.
      // Resume it here if it's suspended.
      if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume();
      }
      button.parentNode.removeChild(button);
      container.appendChild(loadingElement);
      audioPlayer.play();
    });
    
    container.appendChild(button);
  }

  handleResize() {
    this.scene.size = {
      width: Math.floor(window.innerWidth),
      height: Math.floor(window.innerHeight)
    };
  }
}

function awake() {
  window.controller = new MainController(document.body);
}

document.addEventListener("DOMContentLoaded", awake);