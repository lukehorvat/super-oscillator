import * as THREE from "three";
import oscillators from "web-audio-oscillators";

export default class extends THREE.Group {
  constructor() {
    super();

    this.context = new (window.AudioContext || window.webkitAudioContext)();

    let octaves = 5;
    let semitones = 12;
    let whiteSemitones = [0, 2, 4, 5, 7, 9, 11];
    let blackSemitones = [1, 3, 6, 8, 10];
    let whiteKeyCount = 7;
    let whiteKeyWidth = 40;
    let whiteKeyHeight = 30;
    let whiteKeyDepth = 260;
    let whiteKeyGap = 4;
    let whiteKeyOffsetX = whiteKeyWidth + whiteKeyGap;
    let blackKeyCount = 5;
    let blackKeyWidth = 20;
    let blackKeyHeight = 15;
    let blackKeyDepth = 170;
    let blackKeyOffsetX = whiteKeyOffsetX / 2;
    let blackKeyOffsetZ = -(whiteKeyDepth - blackKeyDepth) / 2;
    let octaveWidth = whiteKeyCount * whiteKeyOffsetX;

    for (let octave = 0; octave < octaves; octave++) {
      let octaveOffsetX = octave * octaveWidth;

      for (let semitone = 0; semitone < semitones; semitone++) {
        let key = new THREE.Mesh();
        let isWhiteKey = whiteSemitones.includes(semitone);

        if (isWhiteKey) {
          key.geometry = new THREE.BoxGeometry(whiteKeyWidth, whiteKeyHeight, whiteKeyDepth);
          key.material = new THREE.MeshToonMaterial({ color: "#ffffff" });
          key.position.x = octaveOffsetX + (whiteSemitones.indexOf(semitone) * whiteKeyOffsetX);
          key.position.y = 0;
          key.position.z = 0;
        } else {
          key.geometry = new THREE.BoxGeometry(blackKeyWidth, blackKeyHeight, blackKeyDepth);
          key.material = new THREE.MeshToonMaterial({ color: "#222222" });
          key.position.x = octaveOffsetX + (blackSemitones.indexOf(semitone) * whiteKeyOffsetX) + blackKeyOffsetX + (semitone >= 6 ? whiteKeyOffsetX : 0);
          key.position.y = whiteKeyHeight;
          key.position.z = blackKeyOffsetZ;
        }

        key.name = `key#${semitone + 1}`;
        this.add(key);
      }
    }
  }

  get boundingBox() {
    return new THREE.Box3().setFromObject(this);
  }

  addClickListener(camera) {
    window.addEventListener("mousedown", () => {
      let vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
      vector.unproject(camera);
      let raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
      let intersects = raycaster.intersectObjects(this.children);
      if (intersects.length > 0) {
        let key = intersects[0].object;
        console.log(key.name);

        this.oscillator = oscillators.organ(this.context);
        this.oscillator.frequency.value = 220;
        this.oscillator.connect(this.context.destination);
        this.oscillator.start();
      }
    });

    window.addEventListener("mouseup", () => {
      this.oscillator.stop();
    });
  }
}
