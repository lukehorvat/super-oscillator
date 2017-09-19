import * as THREE from "three";
import oscillators from "web-audio-oscillators";
import Reverb from "soundbank-reverb";
import teoria from "teoria";

const keyGap = 2;
const keyboardWidth = 1100;
const bottomBoardWidth = keyboardWidth;
const backBoardWidth = keyboardWidth;
const leftBoardWidth = keyboardWidth / 25;
const rightBoardWidth = leftBoardWidth;
const oscillatorButtonWidth = backBoardWidth / 10;
const keyboardHeight = 70;
const bottomBoardHeight = keyboardHeight / 3;
const oscillatorButtonHeight = 6;
const oscillatorButtonPressHeight = 2;
const backBoardHeight = keyboardHeight - oscillatorButtonHeight - bottomBoardHeight;
const leftBoardHeight = backBoardHeight;
const rightBoardHeight = leftBoardHeight;
const blackKeyHeight = (keyboardHeight - bottomBoardHeight - keyGap) / 1.3;
const whiteKeyHeight = blackKeyHeight / 1.5;
const keyPressHeight = keyboardHeight - bottomBoardHeight - keyGap - blackKeyHeight;
const keyboardDepth = 180;
const bottomBoardDepth = keyboardDepth;
const backBoardDepth = keyboardDepth / 3;
const leftBoardDepth = keyboardDepth - backBoardDepth;
const rightBoardDepth = leftBoardDepth;
const oscillatorButtonDepth = backBoardDepth / 2;
const whiteKeyDepth = keyboardDepth - backBoardDepth - keyGap;
const blackKeyDepth = whiteKeyDepth / 1.6;

export default class extends THREE.Group {
  constructor() {
    super();

    let boardMaterial = new THREE.MeshPhysicalMaterial({ color: "#3a3a3a", emissive: "#1a1a1a", reflectivity: 0.1, metalness: 0.1, side: THREE.DoubleSide });
    let firstNote = teoria.note("C2");
    let lastNote = teoria.note("B5");

    this.createOscillatorButton();
    this.createBottomBoard(boardMaterial);
    this.createBackBoard(boardMaterial);
    this.createLeftBoard(boardMaterial);
    this.createRightBoard(boardMaterial);
    this.createKeys(firstNote, lastNote);

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.gain = this.audioContext.createGain();
    this.gain.gain.value = 0.2; // TODO: Add UI control for this.
    this.reverb = Reverb(this.audioContext);
    this.reverb.time = 1;
    this.reverb.wet.value = 0.8;
    this.reverb.dry.value = 0.6;
    this.oscillatorIndex = 1;
  }

  createOscillatorButton() {
    let mesh = new THREE.Mesh();
    mesh.name = "oscillator-button";
    mesh.material = new THREE.MeshPhysicalMaterial({ color: "#555555", reflectivity: 1, metalness: 1 });
    mesh.geometry = new THREE.BoxGeometry(oscillatorButtonWidth, oscillatorButtonHeight, oscillatorButtonDepth);
    mesh.position.x = (keyboardWidth / 2) - (backBoardWidth / 2);
    mesh.position.y = -(keyboardHeight / 2) + bottomBoardHeight + backBoardHeight + (oscillatorButtonHeight / 2);
    mesh.position.z = -(keyboardDepth / 2) + (backBoardDepth / 2);
    this.add(mesh);
  }

  createBottomBoard(boardMaterial) {
    let mesh = new THREE.Mesh();
    mesh.name = "bottom-board";
    mesh.material = boardMaterial;
    mesh.geometry = new THREE.BoxGeometry(bottomBoardWidth, bottomBoardHeight, bottomBoardDepth);
    mesh.position.x = -(keyboardWidth / 2) + (bottomBoardWidth / 2);
    mesh.position.y = -(keyboardHeight / 2) + (bottomBoardHeight / 2);
    mesh.position.z = -(keyboardDepth / 2) + (bottomBoardDepth / 2);
    this.add(mesh);
  }

  createBackBoard(boardMaterial) {
    let mesh = new THREE.Mesh();
    mesh.name = "back-board";
    mesh.material = boardMaterial;
    mesh.geometry = new THREE.BoxGeometry(backBoardWidth, backBoardHeight, backBoardDepth);
    mesh.position.x = -(keyboardWidth / 2) + (backBoardWidth / 2);
    mesh.position.y = -(keyboardHeight / 2) + bottomBoardHeight + (backBoardHeight / 2);
    mesh.position.z = -(keyboardDepth / 2) + (backBoardDepth / 2);
    this.add(mesh);
  }

  createLeftBoard(boardMaterial) {
    let hypotenuse = Math.hypot(leftBoardHeight, leftBoardDepth);
    let angle = Math.asin(leftBoardDepth / hypotenuse);

    let mesh = new THREE.Mesh();
    mesh.name = "left-board";
    mesh.material = boardMaterial;
    mesh.geometry = new THREE.Geometry();
    mesh.position.x = -(keyboardWidth / 2);
    mesh.position.y = -(keyboardHeight / 2) + bottomBoardHeight;
    mesh.position.z = (keyboardDepth / 2);

    let mesh2 = new THREE.Mesh();
    mesh2.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(leftBoardWidth, 0),
      new THREE.Vector2(leftBoardWidth, hypotenuse),
      new THREE.Vector2(0, hypotenuse),
    ]));
    mesh2.position.x = 0;
    mesh2.position.y = 0;
    mesh2.position.z = 0;
    mesh2.rotation.x = -angle;
    mesh.geometry.mergeMesh(mesh2);

    let mesh3 = new THREE.Mesh();
    mesh3.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(leftBoardDepth, 0),
      new THREE.Vector2(0, leftBoardHeight),
    ]));
    mesh3.position.x = 0;
    mesh3.position.y = 0;
    mesh3.position.z = -leftBoardDepth;
    mesh3.rotation.y = -Math.PI / 2;
    mesh.geometry.mergeMesh(mesh3);

    let mesh4 = new THREE.Mesh();
    mesh4.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(leftBoardDepth, 0),
      new THREE.Vector2(0, leftBoardHeight),
    ]));
    mesh4.position.x = leftBoardWidth;
    mesh4.position.y = 0;
    mesh4.position.z = -leftBoardDepth;
    mesh4.rotation.y = -Math.PI / 2;
    mesh.geometry.mergeMesh(mesh4);

    this.add(mesh);
  }

  createRightBoard(boardMaterial) {
    let hypotenuse = Math.hypot(rightBoardHeight, rightBoardDepth);
    let angle = Math.asin(rightBoardDepth / hypotenuse);

    let mesh = new THREE.Mesh();
    mesh.name = "right-board";
    mesh.material = boardMaterial;
    mesh.geometry = new THREE.Geometry();
    mesh.position.x = keyboardWidth / 2;
    mesh.position.y = -(keyboardHeight / 2) + bottomBoardHeight;
    mesh.position.z = (keyboardDepth / 2);

    let mesh2 = new THREE.Mesh();
    mesh2.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(-rightBoardWidth, 0),
      new THREE.Vector2(-rightBoardWidth, hypotenuse),
      new THREE.Vector2(0, hypotenuse),
    ]));
    mesh2.position.x = 0;
    mesh2.position.y = 0;
    mesh2.position.z = 0;
    mesh2.rotation.x = -angle;
    mesh.geometry.mergeMesh(mesh2);

    let mesh3 = new THREE.Mesh();
    mesh3.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(rightBoardDepth, 0),
      new THREE.Vector2(0, rightBoardHeight),
    ]));
    mesh3.position.x = 0;
    mesh3.position.y = 0;
    mesh3.position.z = -rightBoardDepth;
    mesh3.rotation.y = -Math.PI / 2;
    mesh.geometry.mergeMesh(mesh3);

    let mesh4 = new THREE.Mesh();
    mesh4.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(rightBoardDepth, 0),
      new THREE.Vector2(0, rightBoardHeight),
    ]));
    mesh4.position.x = -rightBoardWidth;
    mesh4.position.y = 0;
    mesh4.position.z = -rightBoardDepth;
    mesh4.rotation.y = -Math.PI / 2;
    mesh.geometry.mergeMesh(mesh4);

    this.add(mesh);
  }

  createKeys(firstNote, lastNote) {
    let semitones = teoria.interval(firstNote, lastNote).semitones() + 1;
    let notes = Array.from({ length: semitones }, (_, semitone) => teoria.note.fromKey(firstNote.key() + semitone));
    notes.forEach(note => this.createKey(note, notes));
  }

  createKey(note, notes) {
    let semitone = notes.indexOf(note);
    let keyWidth = ((keyboardWidth - leftBoardWidth - rightBoardWidth - ((notes.length + 1) * keyGap)) / notes.length);
    let mesh = new THREE.Mesh();
    mesh.name = "key";
    mesh.userData.frequency = note.fq();
    mesh.position.x = -(keyboardWidth / 2) + leftBoardWidth + keyGap + (keyWidth / 2) + ((keyWidth + keyGap) * semitone);

    if (note.accidental()) {
      mesh.position.y = -(keyboardHeight / 2) + bottomBoardHeight + keyGap + keyPressHeight + (blackKeyHeight / 2);
      mesh.position.z = -(keyboardDepth / 2) + backBoardDepth + (blackKeyDepth / 2);
      mesh.material = new THREE.MeshPhysicalMaterial({ color: "#333333", emissive: "#000000", reflectivity: 0.1, metalness: 0.1 });
      mesh.geometry = new THREE.BoxGeometry(keyWidth, blackKeyHeight, blackKeyDepth);
    } else {
      mesh.position.y = -(keyboardHeight / 2) + bottomBoardHeight + keyGap + keyPressHeight + (whiteKeyHeight / 2);
      mesh.position.z = -(keyboardDepth / 2) + backBoardDepth + (whiteKeyDepth / 2);
      mesh.material = new THREE.MeshPhysicalMaterial({ color: "#dddddd", emissive: "#888888", reflectivity: 0.5, metalness: 0.5 });
      mesh.geometry = new THREE.BoxGeometry(keyWidth, whiteKeyHeight, whiteKeyDepth);

      let previousNote = notes[semitone - 1];
      if (previousNote && previousNote.accidental()) {
        let mesh2 = new THREE.Mesh();
        mesh2.geometry = new THREE.BoxGeometry((keyWidth / 2) + (keyGap / 2), whiteKeyHeight, whiteKeyDepth - blackKeyDepth - keyGap);
        mesh2.position.x = -(keyWidth / 2) - (mesh2.geometry.parameters.width / 2);
        mesh2.position.y = 0;
        mesh2.position.z = (whiteKeyDepth / 2) - (mesh2.geometry.parameters.depth / 2);
        mesh.geometry.mergeMesh(mesh2);
      }

      let nextNote = notes[semitone + 1];
      if (nextNote && nextNote.accidental()) {
        let mesh3 = new THREE.Mesh();
        mesh3.geometry = new THREE.BoxGeometry((keyWidth / 2) + (keyGap / 2), whiteKeyHeight, whiteKeyDepth - blackKeyDepth - keyGap);
        mesh3.position.x = (keyWidth / 2) + (mesh3.geometry.parameters.width / 2);
        mesh3.position.y = 0;
        mesh3.position.z = (whiteKeyDepth / 2) - (mesh3.geometry.parameters.depth / 2);
        mesh.geometry.mergeMesh(mesh3);
      }
    }

    this.add(mesh);
  }

  addClickListener(camera) {
    let clickedObject, oscillator;

    window.addEventListener("mousedown", () => {
      let vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
      vector.unproject(camera);
      let raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
      let intersects = raycaster.intersectObjects(this.children);
      if (intersects.length === 0) return;
      clickedObject = intersects[0].object;

      switch (clickedObject.name) {
        case "oscillator-button":
          clickedObject.position.y -= oscillatorButtonPressHeight;
          this.oscillatorIndex = this.oscillatorIndex < Object.entries(oscillators).length - 1 ? this.oscillatorIndex + 1 : 0;
          break;
        case "key":
          clickedObject.position.y -= keyPressHeight;
          oscillator = Object.values(oscillators)[this.oscillatorIndex](this.audioContext);
          oscillator.frequency.value = clickedObject.userData.frequency;
          oscillator.connect(this.gain).connect(this.reverb).connect(this.audioContext.destination);
          oscillator.start();
          break;
      }
    });

    window.addEventListener("mouseup", () => {
      if (!clickedObject) return;

      switch (clickedObject.name) {
        case "oscillator-button":
          clickedObject.position.y += oscillatorButtonPressHeight;
          break;
        case "key":
          clickedObject.position.y += keyPressHeight;
          oscillator.stop();
          break;
      }

      clickedObject = null;
    });
  }
}
