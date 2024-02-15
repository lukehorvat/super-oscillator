import * as THREE from 'three';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';

export default class Synthesizer extends THREE.Group {
  private static font: Font;

  constructor() {
    super();

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(100, 100, 100),
      new THREE.MeshBasicMaterial({ color: '#ff0000' })
    );
    this.add(cube);
  }

  static async init(): Promise<void> {
    const loader = new FontLoader();
    this.font = await loader.loadAsync('fonts/share-tech-mono.json');
  }
}
