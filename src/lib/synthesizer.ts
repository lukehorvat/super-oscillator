import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { NoteLiteral, Range, Scale } from 'tonal';
import wrapIndex from 'wrap-index';
import * as ThreeUtils from './three-utils';
import { OscillationGraph } from './oscillation-graph';
import oscillators, { CustomOscillatorType } from 'web-audio-oscillators';

export class Synthesizer extends THREE.Group {
  private static assets: { model: GLTF; font: Font };
  private readonly model: THREE.Group;
  private readonly oscillationGraph: OscillationGraph;
  private oscillatorType: CustomOscillatorType;
  private clickedChild?: THREE.Object3D | null;

  constructor() {
    super();

    this.model = Synthesizer.assets.model.scene.clone();
    ThreeUtils.centerObject(this.model);
    this.add(this.model);

    const range = Range.numeric([0, this.keys.length - 1]);
    const notes: NoteLiteral[] = range.map(Scale.steps('C2 chromatic'));
    this.keys.forEach((key, i) => (key.userData.note = notes[i]));

    this.oscillatorType = 'sine';
    this.oscillationGraph = new OscillationGraph(notes);
    this.oscillationGraph.rebuildOscillators(this.oscillatorType);
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
      const note: NoteLiteral = this.clickedChild.userData.note;
      this.oscillationGraph.openNoteGate(note);
    } else if (
      this.nextButton === this.clickedChild ||
      this.previousButton === this.clickedChild
    ) {
      // TODO: Clear screen text.
    }
  }

  private onPointerUp(): void {
    if (!this.clickedChild) return;

    if (this.keys.includes(this.clickedChild)) {
      const note: NoteLiteral = this.clickedChild.userData.note;
      this.oscillationGraph.closeNoteGate(note);
    } else if (
      this.nextButton === this.clickedChild ||
      this.previousButton === this.clickedChild
    ) {
      const oscillatorTypes = Object.keys(
        oscillators
      ) as CustomOscillatorType[];
      const oscillatorIndex = oscillatorTypes.indexOf(this.oscillatorType);
      const increment = this.clickedChild === this.nextButton ? 1 : -1;
      this.oscillatorType = wrapIndex(
        oscillatorIndex + increment,
        oscillatorTypes
      );
      this.oscillationGraph.rebuildOscillators(this.oscillatorType);

      // TODO: Show screen text.
      console.log(this.oscillatorType);
    }

    this.clickedChild = null;
  }

  private get keys(): THREE.Object3D[] {
    const keyNameRegex = /^key_(\d+)$/;
    return this.model.getObjectByName('keys')!.children.sort((key1, key2) => {
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
