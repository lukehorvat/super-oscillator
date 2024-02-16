import * as THREE from 'three';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Note, Range } from 'tonal';

export default class Synthesizer extends THREE.Group {
  private static font: Font;

  constructor() {
    super();

    Range.chromatic(['C2', 'B5']).forEach((note, index) => {
      console.log('!note', note, Note.freq(note));
      const key = new THREE.Mesh();
      key.geometry = new THREE.BoxGeometry(10, 5, 50);
      key.material = new THREE.MeshBasicMaterial({ color: '#ffffff' });
      key.position.x = index * (10 + 2);
      this.add(key);
    });
  }

  static async init(): Promise<void> {
    const loader = new FontLoader();
    this.font = await loader.loadAsync('fonts/share-tech-mono.json');
  }
}
