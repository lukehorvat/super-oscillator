import * as THREE from 'three';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Range } from 'tonal';
import * as ThreeUtils from '../three-utils';
import Key from './key';

export default class Synthesizer extends THREE.Group {
  private static font: Font;
  private clickedChild: THREE.Object3D | null;

  constructor() {
    super();

    this.clickedChild = null;

    Range.chromatic(['C2', 'B5']).map((note, index) => {
      const key = new Key(note);
      key.position.x = index * (10 + 2);
      this.add(key);
    });
  }

  addPointerListener(
    renderer: THREE.Renderer,
    camera: THREE.PerspectiveCamera
  ): void {
    const clickableChildren = this.children.filter(
      (child) => child instanceof Key
    );
    const canvas = renderer.domElement;

    canvas.addEventListener('pointerdown', (event) => {
      // In case the previous pointerdown wasn't followed by a pointerup, force a pointerup now.
      this.onPointerUp();

      if (event.buttons !== 1) return;

      this.clickedChild = ThreeUtils.getObjectAtCoord(
        clickableChildren,
        event.clientX,
        event.clientY,
        renderer,
        camera
      );
      this.onPointerDown();
    });

    canvas.addEventListener('pointerup', () => {
      this.onPointerUp();
    });

    canvas.addEventListener('pointermove', (event) => {
      const child = ThreeUtils.getObjectAtCoord(
        clickableChildren,
        event.clientX,
        event.clientY,
        renderer,
        camera
      );

      // If a key was previously clicked and the pointer has moved to another key, make
      // that the new "clicked" key. This allows keys to be played in a click+drag manner.
      if (
        this.clickedChild !== child &&
        this.clickedChild instanceof Key &&
        child instanceof Key
      ) {
        this.onPointerUp();
        this.clickedChild = child;
        this.onPointerDown();
      }

      canvas.style.cursor = child ? 'pointer' : 'default';
    });

    canvas.addEventListener('pointerleave', () => {
      // The pointer left the canvas, so cancel the last click.
      this.onPointerUp();
    });
  }

  onPointerDown(): void {
    if (this.clickedChild instanceof Key) {
      this.clickedChild.press();
    }
  }

  onPointerUp(): void {
    if (this.clickedChild instanceof Key) {
      this.clickedChild.release();
    }

    this.clickedChild = null;
  }

  static async init(): Promise<void> {
    const loader = new FontLoader();
    this.font = await loader.loadAsync('fonts/share-tech-mono.json');
  }
}
