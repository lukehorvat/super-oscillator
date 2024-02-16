import * as THREE from 'three';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Range } from 'tonal';
import Key from './key';

export default class Synthesizer extends THREE.Group {
  private static font: Font;

  constructor() {
    super();

    Range.chromatic(['C2', 'B5']).map((note, index) => {
      const key = new Key(note);
      key.position.x = index * (10 + 2);
      this.add(key);
    });
  }

  static async init(): Promise<void> {
    const loader = new FontLoader();
    this.font = await loader.loadAsync('fonts/share-tech-mono.json');
  }
}
