import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Note, Scale } from 'tonal';
import * as ThreeUtils from './three-utils';

export class Synthesizer extends THREE.Group {
  private static assets: { model: GLTF; font: Font };
  private readonly model: THREE.Group;
  private clickedChild?: THREE.Object3D | null;

  constructor() {
    super();

    this.model = Synthesizer.assets.model.scene.clone();
    ThreeUtils.centerObject(this.model);
    this.add(this.model);

    const audioContext = new AudioContext();
    const volumeNode = audioContext.createGain();
    volumeNode.gain.value = 0.2; // TODO: Add UI control for this.
    volumeNode.connect(audioContext.destination);

    let note = Note.get('C2');
    this.keys.forEach((key) => {
      const gateNode = audioContext.createGain();
      gateNode.gain.value = 0;
      gateNode.connect(volumeNode);

      const oscillatorNode = audioContext.createOscillator();
      oscillatorNode.type = 'sawtooth';
      oscillatorNode.frequency.value = note.freq!;
      oscillatorNode.connect(gateNode);
      oscillatorNode.start();

      key.userData.gateNode = gateNode;
      note = Note.get(
        Note.simplify(Scale.get([note.name, 'chromatic']).notes[1])
      );
    });
  }

  addPointerListener(
    renderer: THREE.Renderer,
    camera: THREE.PerspectiveCamera
  ): void {
    const clickableChildren = [
      ...this.keys,
      this.previousButton,
      this.nextButton,
    ];
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
      canvas.style.cursor = child ? 'pointer' : 'default';

      // If a key was previously clicked and the pointer has moved to another key, make
      // that the new "clicked" key. This allows keys to be played in a click+drag manner.
      if (
        !!child &&
        !!this.clickedChild &&
        child !== this.clickedChild &&
        this.keys.includes(child) &&
        this.keys.includes(this.clickedChild)
      ) {
        this.onPointerUp();
        this.clickedChild = child;
        this.onPointerDown();
      }
    });

    canvas.addEventListener('pointerleave', () => {
      // The pointer left the canvas, so cancel the last click.
      this.onPointerUp();
    });
  }

  private onPointerDown(): void {
    if (!this.clickedChild) return;

    if (this.keys.includes(this.clickedChild)) {
      const gateNode: GainNode = this.clickedChild.userData.gateNode;
      gateNode.gain.setTargetAtTime(1, gateNode.context.currentTime, 0.02);
    }
  }

  private onPointerUp(): void {
    if (!this.clickedChild) return;

    if (this.keys.includes(this.clickedChild)) {
      const gateNode: GainNode = this.clickedChild.userData.gateNode;
      gateNode.gain.setTargetAtTime(0, gateNode.context.currentTime, 0.01);
    }

    this.clickedChild = null;
  }

  private get keys(): THREE.Object3D[] {
    const keyNameRegex = /^key_(\d+)$/;
    return this.model.children
      .filter((child) => child.name.match(keyNameRegex))
      .sort((key1, key2) => {
        return (
          Number(key1.name.match(keyNameRegex)![1]) -
          Number(key2.name.match(keyNameRegex)![1])
        );
      });
  }

  private get previousButton(): THREE.Object3D {
    return this.model.getObjectByName('previous_button')!;
  }

  private get nextButton(): THREE.Object3D {
    return this.model.getObjectByName('next_button')!;
  }

  private get screen(): THREE.Object3D {
    return this.model.getObjectByName('screen')!;
  }

  static async loadAssets(): Promise<void> {
    const modelLoader = new GLTFLoader();
    const fontLoader = new FontLoader();

    this.assets = {
      model: await modelLoader.loadAsync('models/synthesizer.glb'),
      font: await fontLoader.loadAsync('fonts/share-tech-mono.json'),
    };
  }
}
