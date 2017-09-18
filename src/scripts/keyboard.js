import * as THREE from "three";
import oscillators from "web-audio-oscillators";
import Reverb from "soundbank-reverb";
import teoria from "teoria";

const keyGap = 3;
const keyboardWidth = 1100;
const bottomBoardWidth = keyboardWidth;
const backBoardWidth = keyboardWidth;
const leftBoardWidth = keyboardWidth / 25;
const rightBoardWidth = leftBoardWidth;
const keyboardHeight = 80;
const bottomBoardHeight = keyboardHeight / 3;
const backBoardHeight = keyboardHeight - bottomBoardHeight;
const leftBoardHeight = backBoardHeight;
const rightBoardHeight = leftBoardHeight;
const blackKeyHeight = (keyboardHeight - bottomBoardHeight - keyGap) / 1.3;
const whiteKeyHeight = blackKeyHeight / 1.5;
const keyPressHeight = keyboardHeight - bottomBoardHeight - keyGap - blackKeyHeight;
const keyboardDepth = 200;
const bottomBoardDepth = keyboardDepth;
const backBoardDepth = keyboardDepth / 3;
const leftBoardDepth = keyboardDepth - backBoardDepth;
const rightBoardDepth = leftBoardDepth;
const whiteKeyDepth = keyboardDepth - backBoardDepth - keyGap;
const blackKeyDepth = whiteKeyDepth / 1.6;

export default class extends THREE.Group {
  constructor(options = {}) {
    super();

    let boardMaterial = new THREE.MeshPhysicalMaterial({ color: options.color || "#FFFF00", reflectivity: 0.4, emissive: "#FFFF00", emissiveIntensity: 0.3, metalness: 0, side: THREE.DoubleSide });
    let firstNote = teoria.note(options.firstNote || "C2");
    let lastNote = teoria.note(options.lastNote || "B5");

    this.createBottomBoard(boardMaterial);
    this.createBackBoard(boardMaterial);
    this.createLeftBoard(boardMaterial);
    this.createRightBoard(boardMaterial);
    this.createKeys(firstNote, lastNote);

    this.audioContext = options.audioContext || new (window.AudioContext || window.webkitAudioContext)();
    this.gain = this.audioContext.createGain();
    this.gain.gain.value = 0.2; // TODO: Add UI control for this.
    this.reverb = Reverb(this.audioContext);
    this.reverb.time = 1;
    this.reverb.wet.value = 0.8;
    this.reverb.dry.value = 0.6;
  }

  createBottomBoard(boardMaterial) {
    let mesh = new THREE.Mesh();
    mesh.material = boardMaterial;
    mesh.geometry = new THREE.BoxGeometry(bottomBoardWidth, bottomBoardHeight, bottomBoardDepth);
    mesh.position.x = -(keyboardWidth / 2) + (bottomBoardWidth / 2);
    mesh.position.y = -(keyboardHeight / 2) + (bottomBoardHeight / 2);
    mesh.position.z = -(keyboardDepth / 2) + (bottomBoardDepth / 2);
    this.add(mesh);
  }

  createBackBoard(boardMaterial) {
    let mesh = new THREE.Mesh();
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
    mesh.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(leftBoardWidth, 0),
      new THREE.Vector2(leftBoardWidth, hypotenuse),
      new THREE.Vector2(0, hypotenuse),
    ]));
    mesh.material = boardMaterial;
    mesh.position.x = -(keyboardWidth / 2);
    mesh.position.y = -(keyboardHeight / 2) + bottomBoardHeight;
    mesh.position.z = (keyboardDepth / 2);
    mesh.rotation.x = -angle;
    this.add(mesh);

    let mesh2 = new THREE.Mesh();
    mesh2.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(leftBoardDepth, 0),
      new THREE.Vector2(0, leftBoardHeight)
    ]));
    mesh2.material = boardMaterial;
    mesh2.position.x = -(keyboardWidth / 2);
    mesh2.position.y = -(keyboardHeight / 2) + bottomBoardHeight;
    mesh2.position.z = -(keyboardDepth / 2) + backBoardDepth;
    mesh2.rotation.y = -Math.PI / 2;
    this.add(mesh2);

    let mesh3 = new THREE.Mesh();
    mesh3.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(leftBoardDepth, 0),
      new THREE.Vector2(0, leftBoardHeight)
    ]));
    mesh3.material = boardMaterial;
    mesh3.position.x = -(keyboardWidth / 2) + leftBoardWidth;
    mesh3.position.y = -(keyboardHeight / 2) + bottomBoardHeight;
    mesh3.position.z = -(keyboardDepth / 2) + backBoardDepth;
    mesh3.rotation.y = -Math.PI / 2;
    this.add(mesh3);
  }

  createRightBoard(boardMaterial) {
    let hypotenuse = Math.hypot(rightBoardHeight, rightBoardDepth);
    let angle = Math.asin(rightBoardDepth / hypotenuse);

    let mesh = new THREE.Mesh();
    mesh.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(-rightBoardWidth, 0),
      new THREE.Vector2(-rightBoardWidth, hypotenuse),
      new THREE.Vector2(0, hypotenuse),
    ]));
    mesh.material = boardMaterial;
    mesh.position.x = keyboardWidth / 2;
    mesh.position.y = -(keyboardHeight / 2) + bottomBoardHeight;
    mesh.position.z = (keyboardDepth / 2);
    mesh.rotation.x = -angle;
    this.add(mesh);

    let mesh2 = new THREE.Mesh();
    mesh2.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(rightBoardDepth, 0),
      new THREE.Vector2(0, rightBoardHeight)
    ]));
    mesh2.material = boardMaterial;
    mesh2.position.x = keyboardWidth / 2;
    mesh2.position.y = -(keyboardHeight / 2) + bottomBoardHeight;
    mesh2.position.z = -(keyboardDepth / 2) + backBoardDepth;
    mesh2.rotation.y = -Math.PI / 2;
    this.add(mesh2);

    let mesh3 = new THREE.Mesh();
    mesh3.geometry = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(rightBoardDepth, 0),
      new THREE.Vector2(0, rightBoardHeight)
    ]));
    mesh3.material = boardMaterial;
    mesh3.position.x = (keyboardWidth / 2) - rightBoardWidth;
    mesh3.position.y = -(keyboardHeight / 2) + bottomBoardHeight;
    mesh3.position.z = -(keyboardDepth / 2) + backBoardDepth;
    mesh3.rotation.y = -Math.PI / 2;
    this.add(mesh3);
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
    mesh.userData.frequency = note.fq();
    mesh.position.x = -(keyboardWidth / 2) + leftBoardWidth + keyGap + (keyWidth / 2) + ((keyWidth + keyGap) * semitone);

    if (note.accidental()) {
      mesh.position.y = -(keyboardHeight / 2) + bottomBoardHeight + keyGap + keyPressHeight + (blackKeyHeight / 2);
      mesh.position.z = -(keyboardDepth / 2) + backBoardDepth + (blackKeyDepth / 2);
      mesh.material = new THREE.MeshPhysicalMaterial({ color: "#000000", reflectivity: 1, emissive: "#999999", emissiveIntensity: 0.3 });
      mesh.geometry = new THREE.BoxGeometry(keyWidth, blackKeyHeight, blackKeyDepth);
    } else {
      mesh.position.y = -(keyboardHeight / 2) + bottomBoardHeight + keyGap + keyPressHeight + (whiteKeyHeight / 2);
      mesh.position.z = -(keyboardDepth / 2) + backBoardDepth + (whiteKeyDepth / 2);
      mesh.material = new THREE.MeshPhysicalMaterial({ color: "#ffffff", reflectivity: 1, emissive: "#999999", emissiveIntensity: 1.3 });
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
    let key, oscillator;

    window.addEventListener("mousedown", () => {
      let vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
      vector.unproject(camera);
      let raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
      let intersects = raycaster.intersectObjects(this.children);
      if (intersects.length === 0) return;
      let { object } = intersects[0];
      if (!object.userData.frequency) return;

      key = object;
      key.position.y -= keyPressHeight;
      oscillator = oscillators.organ(this.audioContext);
      oscillator.frequency.value = key.userData.frequency;
      oscillator.connect(this.gain).connect(this.reverb).connect(this.audioContext.destination);
      oscillator.start();
    });

    window.addEventListener("mouseup", () => {
      if (!key) return;

      key.position.y += keyPressHeight;
      key = null;
      oscillator.stop();
      oscillator = null;
    });
  }
}
