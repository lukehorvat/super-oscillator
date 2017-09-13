import * as THREE from "three";
import oscillators from "web-audio-oscillators";
import teoria from "teoria";

const keyGap = 3;
const keyWidth = 20;
const whiteKeyHeight = 20;
const whiteKeyDepth = 120;
const blackKeyHeight = whiteKeyHeight * 1.5;
const blackKeyDepth = whiteKeyDepth / 1.6;

export default class extends THREE.Group {
  constructor(options = {}) {
    super();

    let firstNote = teoria.note(options.firstNote || "C2");
    let lastNote = teoria.note(options.lastNote || "B5");
    let semitones = teoria.interval(firstNote, lastNote).semitones() + 1;
    let notes = Array.from({ length: semitones }, (_, semitone) => teoria.note.fromKey(firstNote.key() + semitone));

    notes.forEach((note, semitone) => {
      let key = new THREE.Mesh();
      key.userData.note = note;
      key.position.x = (keyWidth + keyGap) * semitone;
      key.position.y = 0;

      if (note.accidental()) {
        key.position.z = -(whiteKeyDepth - blackKeyDepth) / 2;
        key.material = new THREE.MeshPhysicalMaterial({ color: "#000000", reflectivity: 1, emissive: "#222222", emissiveIntensity: 1.3 });
        key.geometry = new THREE.BoxGeometry(keyWidth, blackKeyHeight, blackKeyDepth);
      } else {
        key.position.z = 0;
        key.material = new THREE.MeshPhysicalMaterial({ color: "#ffffff", reflectivity: 1, emissive: "#aaaaaa", emissiveIntensity: 1.3 });
        key.geometry = new THREE.BoxGeometry(keyWidth, whiteKeyHeight, whiteKeyDepth);

        let adjacentNotes = [].concat(notes[semitone - 1] || [], notes[semitone + 1] || []);
        adjacentNotes.filter(adjacentNote => adjacentNote.accidental()).forEach(adjacentNote => {
          let mesh = new THREE.Mesh();
          mesh.geometry = new THREE.BoxGeometry((keyWidth / 2) + (keyGap / 2), whiteKeyHeight, whiteKeyDepth - blackKeyDepth - keyGap);
          mesh.position.x = ((keyWidth / 2) + (mesh.geometry.parameters.width / 2)) * teoria.interval(note, adjacentNote).semitones();
          mesh.position.y = 0;
          mesh.position.z = (whiteKeyDepth / 2) - (mesh.geometry.parameters.depth / 2);
          key.geometry.mergeMesh(mesh);
        });
      }

      this.add(key);
    });

    this.context = new (window.AudioContext || window.webkitAudioContext)();
  }

  get boundingBox() {
    return new THREE.Box3().setFromObject(this);
  }

  addClickListener(camera) {
    let key;

    window.addEventListener("mousedown", () => {
      let vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
      vector.unproject(camera);
      let raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
      let intersects = raycaster.intersectObjects(this.children);
      if (intersects.length > 0) {
        key = intersects[0].object;
        key.position.y -= whiteKeyHeight / 2;
        key.userData.oscillator = oscillators.organ(this.context);
        key.userData.oscillator.frequency.value = key.userData.note.fq();
        key.userData.oscillator.connect(this.context.destination);
        key.userData.oscillator.start();
      }
    });

    window.addEventListener("mouseup", () => {
      if (key) {
        key.position.y += whiteKeyHeight / 2;
        key.userData.oscillator.stop();
      }
    });
  }
}
