import * as THREE from "three";
import oscillators from "web-audio-oscillators";
import Reverb from "soundbank-reverb";
import tonal from "tonal";
import wrapIndex from "wrap-index";

export default class Keyboard extends THREE.Group {
  static init() {
    return new Promise(resolve => {
      new THREE.FontLoader().load("fonts/share-tech-mono.json", font => {
        this.font = font;
        resolve();
      });
    });
  }

  constructor() {
    super();

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.gain = this.audioContext.createGain();
    this.gain.gain.value = 0.2; // TODO: Add UI control for this.
    this.reverb = Reverb(this.audioContext);
    this.reverb.time = 1;
    this.reverb.wet.value = 0.8;
    this.reverb.dry.value = 0.6;
    this.oscillatorIndex = Object.keys(oscillators).indexOf("organ");

    this.createBottomBoard();
    this.createBackBoard();
    this.createLeftBoard();
    this.createRightBoard();
    this.createOscillatorScreen();
    this.createOscillatorScreenText();
    this.createOscillatorLeftButton();
    this.createOscillatorRightButton();
    this.createKeys();
  }

  createBottomBoard() {
    this.bottomBoard = new THREE.Mesh();
    this.bottomBoard.material = new THREE.MeshPhysicalMaterial({ color: "#3a3a3a", emissive: "#1a1a1a", reflectivity: 0.1, metalness: 0.1, side: THREE.DoubleSide });
    this.bottomBoard.geometry = new THREE.BoxGeometry(1100, 25, 205);
    this.bottomBoard.bbox.centerX = 0;
    this.bottomBoard.bbox.centerY = 0;
    this.bottomBoard.bbox.centerZ = 0;
    this.add(this.bottomBoard);
  }

  createBackBoard() {
    this.backBoard = new THREE.Mesh();
    this.backBoard.material = this.bottomBoard.material;
    this.backBoard.geometry = new THREE.BoxGeometry(this.bottomBoard.bbox.width, 70, this.bottomBoard.bbox.depth * 0.32);
    this.backBoard.bbox.centerX = this.bottomBoard.bbox.centerX;
    this.backBoard.bbox.minY = this.bottomBoard.bbox.maxY;
    this.backBoard.bbox.minZ = this.bottomBoard.bbox.minZ;
    this.add(this.backBoard);
  }

  createLeftBoard() {
    this.leftBoard = new THREE.Mesh();
    this.leftBoard.material = this.bottomBoard.material;
    this.leftBoard.geometry = new THREE.Geometry();

    let width = this.bottomBoard.bbox.width * 0.06;
    let height = this.backBoard.bbox.height;
    let depth = this.bottomBoard.bbox.depth - this.backBoard.bbox.depth;
    let hypotenuse = Math.hypot(height, depth);
    let angle = Math.asin(depth / hypotenuse);

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
    this.leftBoard.geometry.mergeMesh(mesh1);

    let mesh2 = new THREE.Mesh();
    mesh2.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(depth, 0),
      new THREE.Vector2(0, height),
    ]));
    mesh2.bbox.minX = 0;
    mesh2.bbox.minY = 0;
    mesh2.bbox.minZ = 0;
    mesh2.rotation.y = -Math.PI / 2;
    this.leftBoard.geometry.mergeMesh(mesh2);

    let mesh3 = mesh2.clone();
    mesh3.bbox.maxX = width;
    this.leftBoard.geometry.mergeMesh(mesh3);

    this.leftBoard.bbox.minX = this.bottomBoard.bbox.minX;
    this.leftBoard.bbox.minY = this.bottomBoard.bbox.maxY;
    this.leftBoard.bbox.maxZ = this.bottomBoard.bbox.maxZ;
    this.add(this.leftBoard);
  }

  createRightBoard() {
    this.rightBoard = this.leftBoard.clone();
    this.rightBoard.bbox.maxX = this.bottomBoard.bbox.maxX;
    this.add(this.rightBoard);
  }

  createOscillatorScreen() {
    this.oscillatorScreen = new THREE.Mesh();
    this.oscillatorScreen.material = new THREE.MeshPhysicalMaterial({ color: "#000000", emissive: "#161616", reflectivity: 0.2, metalness: 0.8 });
    this.oscillatorScreen.geometry = new THREE.BoxGeometry(this.backBoard.bbox.width * 0.18, 2, this.backBoard.bbox.depth * 0.6);
    this.oscillatorScreen.bbox.centerX = this.backBoard.bbox.centerX;
    this.oscillatorScreen.bbox.minY = this.backBoard.bbox.maxY;
    this.oscillatorScreen.bbox.centerZ = this.backBoard.bbox.centerZ;
    this.add(this.oscillatorScreen);
  }

  createOscillatorScreenText() {
    let oscillatorName = Object.keys(oscillators)[this.oscillatorIndex].toUpperCase();

    this.oscillatorScreenText = new THREE.Mesh();
    this.oscillatorScreenText.material = new THREE.MeshPhysicalMaterial({ color: "#ff6600", emissive: "#bb3300", reflectivity: 0, metalness: 0 });
    this.oscillatorScreenText.geometry = new THREE.TextGeometry(oscillatorName, { font: Keyboard.font, size: this.oscillatorScreen.bbox.depth * 0.4, height: 1 });
    this.oscillatorScreenText.bbox.centerX = this.oscillatorScreen.bbox.centerX;
    this.oscillatorScreenText.bbox.minY = this.oscillatorScreen.bbox.maxY;
    this.oscillatorScreenText.bbox.minZ = this.oscillatorScreen.bbox.centerZ + (this.oscillatorScreenText.bbox.height / 2);
    this.oscillatorScreenText.rotation.x = -Math.PI / 2;
    this.add(this.oscillatorScreenText);

    // FIXME: Adjust the x position because text doesn't center properly for some reason. Is it a bug in FontLoader?
    this.oscillatorScreenText.position.x -= this.oscillatorScreenText.bbox.width * 0.04;
    this.oscillatorScreenText.position.z += this.oscillatorScreenText.bbox.height * 0.09;
  }

  createOscillatorLeftButton() {
    this.oscillatorLeftButton = new THREE.Mesh();
    this.oscillatorLeftButton.material = new THREE.MeshPhysicalMaterial({ color: "#111111", emissive: "#1a1a1a", reflectivity: 0.1, metalness: 0.7, side: THREE.DoubleSide });
    this.oscillatorLeftButton.geometry = new THREE.Geometry();

    let width = this.backBoard.bbox.width * 0.02;
    let height = 6;
    let depth = this.oscillatorScreen.bbox.depth * 0.7;
    let hypotenuse = Math.hypot(width, depth / 2);
    let angle = Math.asin((depth / 2) / hypotenuse);

    let mesh1 = new THREE.Mesh();
    mesh1.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(-width, depth / 2),
      new THREE.Vector2(0, depth),
    ]));
    mesh1.bbox.minX = 0;
    mesh1.bbox.minY = height;
    mesh1.bbox.maxZ = 0;
    mesh1.rotation.x = Math.PI / 2;
    this.oscillatorLeftButton.geometry.mergeMesh(mesh1);

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
    this.oscillatorLeftButton.geometry.mergeMesh(mesh2);

    let mesh3 = mesh2.clone();
    mesh3.rotation.y = angle;
    this.oscillatorLeftButton.geometry.mergeMesh(mesh3);

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
    mesh4.rotation.y = Math.PI / 2;
    this.oscillatorLeftButton.geometry.mergeMesh(mesh4);

    this.oscillatorLeftButton.bbox.maxX = this.oscillatorScreen.bbox.minX - ((this.backBoard.bbox.depth - this.oscillatorScreen.bbox.depth) / 2);
    this.oscillatorLeftButton.bbox.minY = this.backBoard.bbox.maxY;
    this.oscillatorLeftButton.bbox.centerZ = this.backBoard.bbox.centerZ;
    this.oscillatorLeftButton.userData.pressHeight = this.oscillatorLeftButton.bbox.height / 2;
    this.oscillatorLeftButton.userData.indexIncrement = -1;
    this.add(this.oscillatorLeftButton);
  }

  createOscillatorRightButton() {
    this.oscillatorRightButton = this.oscillatorLeftButton.clone();
    this.oscillatorRightButton.rotation.y = Math.PI;
    this.oscillatorRightButton.bbox.minX = this.oscillatorScreen.bbox.maxX + ((this.backBoard.bbox.depth - this.oscillatorScreen.bbox.depth) / 2);
    this.oscillatorRightButton.bbox.centerZ = this.backBoard.bbox.centerZ;
    this.oscillatorRightButton.userData.indexIncrement = 1;
    this.add(this.oscillatorRightButton);
  }

  createKeys() {
    this.keys = tonal.range.chromatic("C2, B5").map(::this.createKey);
  }

  createKey(note, index, notes) {
    let key = new THREE.Mesh();
    let keyGap = 2;
    let keyWidth = (this.backBoard.bbox.width - this.leftBoard.bbox.width - this.rightBoard.bbox.width - ((notes.length + 1) * keyGap)) / notes.length;
    let keyWhiteHeight = 20;
    let keyWhiteDepth = this.bottomBoard.bbox.depth - this.backBoard.bbox.depth - keyGap;
    let keyBlackHeight = keyWhiteHeight * 1.75;
    let keyBlackDepth = keyWhiteDepth * 0.65;
    let keyPressHeight = keyWhiteHeight / 2;

    if (tonal.note.alt(note)) {
      key.material = new THREE.MeshPhysicalMaterial({ color: "#333333", emissive: "#000000", reflectivity: 0.1, metalness: 0.1 });
      key.geometry = new THREE.BoxGeometry(keyWidth, keyBlackHeight, keyBlackDepth);
    } else {
      key.material = new THREE.MeshPhysicalMaterial({ color: "#dddddd", emissive: "#888888", reflectivity: 0.5, metalness: 0.5 });
      key.geometry = new THREE.BoxGeometry(keyWidth, keyWhiteHeight, keyWhiteDepth);

      let previousNote = notes[index - 1];
      if (previousNote && tonal.note.alt(previousNote)) {
        let mesh1 = new THREE.Mesh();
        mesh1.geometry = new THREE.BoxGeometry((keyWidth / 2) + (keyGap / 2), key.bbox.height, keyWhiteDepth - keyBlackDepth - keyGap);
        mesh1.bbox.maxX = key.bbox.minX;
        mesh1.bbox.minY = key.bbox.minY;
        mesh1.bbox.maxZ = key.bbox.maxZ;
        key.geometry.mergeMesh(mesh1);
      }

      let nextNote = notes[index + 1];
      if (nextNote && tonal.note.alt(nextNote)) {
        let mesh2 = new THREE.Mesh();
        mesh2.geometry = new THREE.BoxGeometry((keyWidth / 2) + (keyGap / 2), key.bbox.height, keyWhiteDepth - keyBlackDepth - keyGap);
        mesh2.bbox.minX = key.bbox.maxX;
        mesh2.bbox.minY = key.bbox.minY;
        mesh2.bbox.maxZ = key.bbox.maxZ;
        key.geometry.mergeMesh(mesh2);
      }
    }

    key.position.x = this.leftBoard.bbox.maxX + keyGap + (keyWidth / 2) + ((keyWidth + keyGap) * index);
    key.bbox.minY = this.bottomBoard.bbox.maxY + keyGap + keyPressHeight;
    key.bbox.minZ = this.backBoard.bbox.maxZ;
    key.userData.pressHeight = keyPressHeight;
    key.userData.frequency = tonal.note.freq(note);
    this.add(key);

    return key;
  }

  addMouseListener(renderer, camera) {
    let clickableObjects = [this.oscillatorLeftButton, this.oscillatorRightButton, ...this.keys];
    let clickedObject;

    window.addEventListener("mousedown", event => {
      // If the previous mousedown event wasn't followed by a mouseup, force a mouseup now.
      if (clickedObject) this.onMouseUp(clickedObject);

      clickedObject = clickableObjects.find(object => camera.isObjectAtCoord({ object, x: event.clientX, y: event.clientY, renderer }));
      this.onMouseDown(clickedObject);
    });

    window.addEventListener("mouseup", event => {
      this.onMouseUp(clickedObject);
      clickedObject = null;
    });

    window.addEventListener("mousemove", event => {
      let object = clickableObjects.find(object => camera.isObjectAtCoord({ object, x: event.clientX, y: event.clientY, renderer }));

      if (this.keys.includes(clickedObject) && this.keys.includes(object) && clickedObject !== object) {
        this.onMouseUp(clickedObject);
        this.onMouseDown(clickedObject = object);
      }

      renderer.domElement.style.cursor = clickableObjects.includes(object) ? "pointer" : null;
    });
  }

  onMouseDown(object) {
    if ([this.oscillatorLeftButton, this.oscillatorRightButton].includes(object)) {
      object.bbox.minY -= object.userData.pressHeight;
      this.oscillatorIndex = wrapIndex(this.oscillatorIndex + object.userData.indexIncrement, Object.entries(oscillators).length);
      this.remove(this.oscillatorScreenText);
    } else if (this.keys.includes(object)) {
      object.bbox.minY -= object.userData.pressHeight;
      this.oscillator = Object.values(oscillators)[this.oscillatorIndex](this.audioContext);
      this.oscillator.frequency.value = object.userData.frequency;
      this.oscillator.connect(this.gain).connect(this.reverb).connect(this.audioContext.destination);
      this.oscillator.start();
    }
  }

  onMouseUp(object) {
    if ([this.oscillatorLeftButton, this.oscillatorRightButton].includes(object)) {
      object.bbox.minY += object.userData.pressHeight;
      this.createOscillatorScreenText();
    } else if (this.keys.includes(object)) {
      object.bbox.minY += object.userData.pressHeight;
      this.oscillator.stop();
    }
  }
}

// Suppress false deprecation warnings when calling tonal.note.alt().
// See: https://github.com/danigb/tonal/issues/38
const { warn } = console;
console.warn = function(msg) { !msg.includes("note.props() is deprecated.") && console::warn(...arguments) };
