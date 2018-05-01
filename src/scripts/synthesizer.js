import * as THREE from "three";
import oscillators from "web-audio-oscillators";
import Reverb from "soundbank-reverb";
import tonal from "tonal";
import wrapIndex from "wrap-index";

const keyboardKeyMap = [
  'q', 'Q', 'w', 'W', 'e', 'r', 'R', 't', 'T', 'y', 'Y', 'u', 'i', 'I', 'o', 'O', 'p',
  'a', 'A', 's', 'S', 'd', 'D', 'f', 'g', 'G', 'h', 'H', 'j', 'k', 'K', 'l', 'L',
  'z', 'Z', 'x', 'c', 'C', 'v', 'V', 'b', 'n', 'N', 'm', 'M', ',', '!', '.'
];

export default class Synthesizer extends THREE.Group {
  constructor(options = {}) {
    super();

    this.options = options;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.gain = this.audioContext.createGain();
    this.gain.gain.value = 0.2; // TODO: Add UI control for this.
    this.reverb = Reverb(this.audioContext);
    this.reverb.time = 1;
    this.reverb.wet.value = 0.8;
    this.reverb.dry.value = 0.6;
    this.oscillatorIndex = Object.keys(oscillators).indexOf("organ");
    this.createBottomPanel();
    this.createBackPanel();
    this.createLeftPanel();
    this.createRightPanel();
    this.createScreen();
    this.createScreenText();
    this.createLeftButton();
    this.createRightButton();
    this.createKeys();
  }

  createBottomPanel() {
    let width = this.options.width;
    let height = this.options.height / 4;
    let depth = this.options.depth;

    this.bottomPanel = new THREE.Mesh();
    this.bottomPanel.material = new THREE.MeshPhysicalMaterial({ color: "#3a3a3a", emissive: "#1a1a1a", reflectivity: 0.1, metalness: 0.1, side: THREE.DoubleSide });
    this.bottomPanel.geometry = new THREE.BoxGeometry(width, height, depth);
    this.bottomPanel.bbox.centerX = 0;
    this.bottomPanel.bbox.centerY = 0;
    this.bottomPanel.bbox.centerZ = 0;
    this.add(this.bottomPanel);
  }

  createBackPanel() {
    let width = this.bottomPanel.bbox.width;
    let height = this.options.height / 1.45;
    let depth = this.bottomPanel.bbox.depth * 0.32;

    this.backPanel = new THREE.Mesh();
    this.backPanel.material = this.bottomPanel.material;
    this.backPanel.geometry = new THREE.BoxGeometry(width, height, depth);
    this.backPanel.bbox.centerX = this.bottomPanel.bbox.centerX;
    this.backPanel.bbox.minY = this.bottomPanel.bbox.maxY;
    this.backPanel.bbox.minZ = this.bottomPanel.bbox.minZ;
    this.add(this.backPanel);
  }

  createLeftPanel() {
    let width = this.bottomPanel.bbox.width * 0.06;
    let height = this.backPanel.bbox.height;
    let depth = this.bottomPanel.bbox.depth - this.backPanel.bbox.depth;
    let hypotenuse = Math.hypot(height, depth);
    let angle = Math.asin(depth / hypotenuse);

    this.leftPanel = new THREE.Mesh();
    this.leftPanel.material = this.bottomPanel.material;
    this.leftPanel.geometry = new THREE.Geometry();

    let mesh1 = new THREE.Mesh();
    mesh1.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(width, 0),
      new THREE.Vector2(width, hypotenuse),
      new THREE.Vector2(0, hypotenuse),
    ]));
    mesh1.bbox.minX = 0;
    mesh1.bbox.minY = 0;
    mesh1.bbox.maxZ = depth;
    mesh1.rotation.x = -angle;
    this.leftPanel.geometry.mergeMesh(mesh1);

    let mesh2 = new THREE.Mesh();
    mesh2.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(depth, 0),
      new THREE.Vector2(0, height),
    ]));
    mesh2.bbox.minX = 0;
    mesh2.bbox.minY = 0;
    mesh2.bbox.minZ = 0;
    mesh2.rotation.y = -THREE.Math.degToRad(90);
    this.leftPanel.geometry.mergeMesh(mesh2);

    let mesh3 = mesh2.clone();
    mesh3.bbox.maxX = width;
    this.leftPanel.geometry.mergeMesh(mesh3);

    this.leftPanel.bbox.minX = this.bottomPanel.bbox.minX;
    this.leftPanel.bbox.minY = this.bottomPanel.bbox.maxY;
    this.leftPanel.bbox.maxZ = this.bottomPanel.bbox.maxZ;
    this.add(this.leftPanel);
  }

  createRightPanel() {
    this.rightPanel = this.leftPanel.clone();
    this.rightPanel.bbox.maxX = this.bottomPanel.bbox.maxX;
    this.add(this.rightPanel);
  }

  createScreen() {
    let width = this.backPanel.bbox.width * 0.18;
    let height = (this.options.height - this.backPanel.bbox.height - this.bottomPanel.bbox.height) / 3;
    let depth = this.backPanel.bbox.depth * 0.6;

    this.screen = new THREE.Mesh();
    this.screen.material = new THREE.MeshPhysicalMaterial({ color: "#000000", emissive: "#161616", reflectivity: 0.2, metalness: 0.8 });
    this.screen.geometry = new THREE.BoxGeometry(width, height, depth);
    this.screen.bbox.centerX = this.backPanel.bbox.centerX;
    this.screen.bbox.minY = this.backPanel.bbox.maxY;
    this.screen.bbox.centerZ = this.backPanel.bbox.centerZ;
    this.add(this.screen);
  }

  createScreenText() {
    let oscillatorName = Object.keys(oscillators)[this.oscillatorIndex].toUpperCase();

    this.screenText = new THREE.Mesh();
    this.screenText.material = new THREE.MeshPhysicalMaterial({ color: "#ff6600", emissive: "#bb3300", reflectivity: 0, metalness: 0 });
    this.screenText.geometry = new THREE.TextGeometry(oscillatorName, { font: Synthesizer.font, size: this.screen.bbox.depth * 0.4, height: 1 });
    this.screenText.bbox.centerX = this.screen.bbox.centerX;
    this.screenText.bbox.minY = this.screen.bbox.maxY;
    this.screenText.bbox.minZ = this.screen.bbox.centerZ + (this.screenText.bbox.height / 2);
    this.screenText.rotation.x = -THREE.Math.degToRad(90);
    this.add(this.screenText);

    // FIXME: Text doesn't center properly; a bug in FontLoader?
    this.screenText.position.x -= 2;
    this.screenText.position.z += 1.7;
  }

  createLeftButton() {
    let width = this.backPanel.bbox.width * 0.02;
    let height = this.options.height - this.backPanel.bbox.height - this.bottomPanel.bbox.height;
    let depth = this.screen.bbox.depth * 0.7;
    let hypotenuse = Math.hypot(width, depth / 2);
    let angle = Math.asin((depth / 2) / hypotenuse);

    this.leftButton = new THREE.Mesh();
    this.leftButton.material = new THREE.MeshPhysicalMaterial({ color: "#111111", emissive: "#1a1a1a", reflectivity: 0.1, metalness: 0.7, side: THREE.DoubleSide });
    this.leftButton.geometry = new THREE.Geometry();

    let mesh1 = new THREE.Mesh();
    mesh1.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(-width, depth / 2),
      new THREE.Vector2(0, depth),
    ]));
    mesh1.bbox.minX = 0;
    mesh1.bbox.minY = height;
    mesh1.bbox.maxZ = 0;
    mesh1.rotation.x = THREE.Math.degToRad(90);
    this.leftButton.geometry.mergeMesh(mesh1);

    let mesh2 = new THREE.Mesh();
    mesh2.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(hypotenuse, 0),
      new THREE.Vector2(hypotenuse, height),
      new THREE.Vector2(0, height),
    ]));
    mesh2.bbox.minX = 0;
    mesh2.bbox.minY = 0;
    mesh2.bbox.maxZ = depth / 2;
    mesh2.rotation.y = -angle;
    this.leftButton.geometry.mergeMesh(mesh2);

    let mesh3 = mesh2.clone();
    mesh3.rotation.y = angle;
    this.leftButton.geometry.mergeMesh(mesh3);

    let mesh4 = new THREE.Mesh();
    mesh4.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(depth, 0),
      new THREE.Vector2(depth, height),
      new THREE.Vector2(0, height),
    ]));
    mesh4.bbox.minX = width;
    mesh4.bbox.minY = 0;
    mesh4.bbox.maxZ = depth;
    mesh4.rotation.y = THREE.Math.degToRad(90);
    this.leftButton.geometry.mergeMesh(mesh4);

    this.leftButton.bbox.maxX = this.screen.bbox.minX - ((this.backPanel.bbox.depth - this.screen.bbox.depth) / 2);
    this.leftButton.bbox.minY = this.backPanel.bbox.maxY;
    this.leftButton.bbox.centerZ = this.backPanel.bbox.centerZ;
    this.leftButton.userData.pressHeight = this.leftButton.bbox.height / 2;
    this.add(this.leftButton);
  }

  createRightButton() {
    this.rightButton = this.leftButton.clone();
    this.rightButton.rotation.y = THREE.Math.degToRad(180);
    this.rightButton.bbox.minX = this.screen.bbox.maxX + ((this.backPanel.bbox.depth - this.screen.bbox.depth) / 2);
    this.rightButton.bbox.centerZ = this.backPanel.bbox.centerZ;
    this.add(this.rightButton);
  }

  createKeys() {
    this.keys = tonal.range.chromatic("C2, B5").map(::this.createKey);
  }

  createKey(note, index, notes) {
    let key = new THREE.Mesh();
    let keyGap = 2;
    let keyWidth = (this.backPanel.bbox.width - this.leftPanel.bbox.width - this.rightPanel.bbox.width - ((notes.length + 1) * keyGap)) / notes.length;
    let keyBlackHeight = this.backPanel.bbox.height / 2;
    let keyWhiteHeight = keyBlackHeight / 1.75;
    let keyWhiteDepth = this.bottomPanel.bbox.depth - this.backPanel.bbox.depth - keyGap;
    let keyBlackDepth = keyWhiteDepth * 0.65;
    let keyPressHeight = keyWhiteHeight / 2;
    let semitone = index % 12;

    if ([1, 3, 6, 8, 10].includes(semitone)) {
      key.material = new THREE.MeshPhysicalMaterial({ color: "#333333", emissive: "#000000", reflectivity: 0.1, metalness: 0.1 });
      key.geometry = new THREE.BoxGeometry(keyWidth, keyBlackHeight, keyBlackDepth);
    } else {
      key.material = new THREE.MeshPhysicalMaterial({ color: "#dddddd", emissive: "#888888", reflectivity: 0.5, metalness: 0.5 });
      key.geometry = new THREE.BoxGeometry(keyWidth, keyWhiteHeight, keyWhiteDepth);

      // Attach an extra geometry to the white key's left side?
      if ([2, 4, 7, 9, 11].includes(semitone)) {
        let width = (keyGap * 0.5) + (keyWidth * (() => {
          switch (semitone) {
            case 2: case 7: return 0.25;
            case 4: case 11: return 0.75;
            case 9: return 0.5;
          }
        })());
        let height = key.bbox.height;
        let depth = keyWhiteDepth - keyBlackDepth - keyGap;

        let mesh1 = new THREE.Mesh();
        mesh1.geometry = new THREE.BoxGeometry(width, height, depth);
        mesh1.bbox.maxX = key.bbox.minX;
        mesh1.bbox.minY = key.bbox.minY;
        mesh1.bbox.maxZ = key.bbox.maxZ;
        key.geometry.mergeMesh(mesh1);
      }

      // Attach an extra geometry to the white key's right side?
      if ([0, 2, 5, 7, 9].includes(semitone)) {
        let width = (keyGap * 0.5) + (keyWidth * (() => {
          switch (semitone) {
            case 2: case 9: return 0.25;
            case 0: case 5: return 0.75;
            case 7: return 0.5;
          }
        })());
        let height = key.bbox.height;
        let depth = keyWhiteDepth - keyBlackDepth - keyGap;

        let mesh2 = new THREE.Mesh();
        mesh2.geometry = new THREE.BoxGeometry(width, height, depth);
        mesh2.bbox.minX = key.bbox.maxX;
        mesh2.bbox.minY = key.bbox.minY;
        mesh2.bbox.maxZ = key.bbox.maxZ;
        key.geometry.mergeMesh(mesh2);
      }
    }

    key.position.x = this.leftPanel.bbox.maxX + keyGap + (keyWidth / 2) + ((keyWidth + keyGap) * index);
    key.bbox.minY = this.bottomPanel.bbox.maxY + keyGap + keyPressHeight;
    key.bbox.minZ = this.backPanel.bbox.maxZ;
    key.userData.pressHeight = keyPressHeight;
    key.userData.frequency = tonal.note.freq(note);
    this.add(key);

    return key;
  }

  addInputListener(renderer, camera) {
    let clickableObjects = [this.leftButton, this.rightButton, ...this.keys];

    window.addEventListener("keydown", event => {
      let key = this.keys[keyboardKeyMap.indexOf(event.key)];
      if (key && !this.clickedObject) {
        this.clickedObject = key;
        this.onMouseDown();
      }
    });

    window.addEventListener("keyup", event => {
      let key = this.keys[keyboardKeyMap.indexOf(event.key)];
      if (this.clickedObject === key || event.key === "Shift") {
        this.onMouseUp();
      }
    });

    renderer.domElement.addEventListener("mousedown", event => {
      this.onMouseUp(); // In case the previous mousedown event wasn't followed by a mouseup, force a mouseup now.
      this.isMouseDown = true;
      if (event.buttons !== 1) return;
      this.clickedObject = clickableObjects.find(object => camera.isObjectAtCoord({ object, x: event.clientX, y: event.clientY, renderer }));
      this.onMouseDown();
    });

    renderer.domElement.addEventListener("mouseup", event => {
      this.isMouseDown = false;
      this.onMouseUp();
    });

    renderer.domElement.addEventListener("mousemove", event => {
      let object = clickableObjects.find(object => camera.isObjectAtCoord({ object, x: event.clientX, y: event.clientY, renderer }));
      renderer.domElement.style.cursor = object ? "pointer" : null;

      // If a key was previously clicked and the mouse has moved to another key, make that
      // the new "clicked" key. This allows keys to be played in a click+drag manner.
      if (this.clickedObject !== object && this.keys.includes(this.clickedObject) && this.keys.includes(object) && this.isMouseDown) {
        this.onMouseUp();
        this.clickedObject = object;
        this.onMouseDown();
      }
    });

    renderer.domElement.addEventListener("mouseleave", event => {
      this.onMouseUp(); // The mouse left the canvas, so cancel the last click.
    });
  }

  onMouseDown() {
    if (!this.clickedObject) return;

    if ([this.leftButton, this.rightButton].includes(this.clickedObject)) {
      this.clickedObject.bbox.minY -= this.clickedObject.userData.pressHeight;
      this.oscillatorIndex = wrapIndex(this.oscillatorIndex + (this.clickedObject === this.rightButton ? 1 : -1), Object.entries(oscillators).length);
      this.remove(this.screenText);
    } else if (this.keys.includes(this.clickedObject)) {
      this.clickedObject.bbox.minY -= this.clickedObject.userData.pressHeight;
      this.oscillator = Object.values(oscillators)[this.oscillatorIndex](this.audioContext);
      this.oscillator.frequency.value = this.clickedObject.userData.frequency;
      this.oscillator.connect(this.gain).connect(this.reverb).connect(this.audioContext.destination);
      this.oscillator.start();
    }
  }

  onMouseUp() {
    if (!this.clickedObject) return;

    if ([this.leftButton, this.rightButton].includes(this.clickedObject)) {
      this.clickedObject.bbox.minY += this.clickedObject.userData.pressHeight;
      this.createScreenText();
    } else if (this.keys.includes(this.clickedObject)) {
      this.clickedObject.bbox.minY += this.clickedObject.userData.pressHeight;
      this.oscillator.stop();
    }

    this.clickedObject = null;
  }

  static init() {
    return new Promise(resolve => {
      new THREE.FontLoader().load("fonts/share-tech-mono.json", font => {
        this.font = font;
        resolve();
      });
    });
  }
}

// Suppress false deprecation warnings when calling tonal.note.alt().
// See: https://github.com/danigb/tonal/issues/38
const { warn } = console;
console.warn = function(msg) { !msg.includes("note.props() is deprecated.") && console::warn(...arguments) };
