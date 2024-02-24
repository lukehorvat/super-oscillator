import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { NoteLiteral, Range, Scale } from 'tonal';
import wrapIndex from 'wrap-index';
import * as ThreeUtils from './three-utils';
import { OscillationGraph } from './oscillation-graph';
import {
  CustomOscillatorType,
  customOscillatorTypes,
} from 'web-audio-oscillators';

export class Synthesizer extends THREE.Group {
  private static readonly keyPressHeight = 0.6;
  private static readonly buttonPressHeight = 0.3;
  private static assets: { model: GLTF; font: Font };

  private readonly model: THREE.Group;
  private readonly oscillationGraph: OscillationGraph;
  private oscillatorType: CustomOscillatorType;
  private screenText?: THREE.Mesh | null;

  constructor() {
    super();

    this.model = Synthesizer.assets.model.scene.clone();
    ThreeUtils.centerObject(this.model);
    this.add(this.model);

    const range = Range.numeric([0, this.keys.length - 1]);
    const notes: NoteLiteral[] = range.map(Scale.steps('C2 chromatic'));
    this.keys.forEach((key, i) => {
      key.userData.note = notes[i];
    });
    this.pressables.forEach((pressable) => {
      pressable.userData.inputSources = new Set<InputSource>();
    });
    this.oscillatorType = 'organ';
    this.oscillationGraph = new OscillationGraph(notes);
    this.oscillationGraph.setOscillatorType(this.oscillatorType);
    this.setScreenText();
  }

  addInputListener(
    renderer: THREE.Renderer,
    camera: THREE.PerspectiveCamera
  ): void {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));

    renderer.domElement.addEventListener(
      'pointerdown',
      this.onPointerDown.bind(this, renderer, camera)
    );
    renderer.domElement.addEventListener(
      'pointerup',
      this.onPointerUp.bind(this)
    );
    renderer.domElement.addEventListener(
      'pointermove',
      this.onPointerMove.bind(this, renderer, camera)
    );
    renderer.domElement.addEventListener(
      'pointerleave',
      this.onPointerUp.bind(this)
    );
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const pressable = this.getPressableFromKeyCode(event.code);
    if (pressable) {
      this.pressDown(pressable, InputSource.Keyboard);
      event.preventDefault(); // Key was handled so prevent any bubbling.
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const pressable = this.getPressableFromKeyCode(event.code);
    if (pressable) {
      this.pressUp(pressable, InputSource.Keyboard);
      event.preventDefault(); // Key was handled so prevent any bubbling.
    }
  }

  private onPointerDown(
    renderer: THREE.Renderer,
    camera: THREE.PerspectiveCamera,
    event: PointerEvent
  ): void {
    // In case the previous pointerdown wasn't followed by a pointerup, clean up.
    this.onPointerUp();

    if (event.buttons !== 1) return;

    const pressable = ThreeUtils.getObjectAtCoord(
      this.pressables,
      event.clientX,
      event.clientY,
      renderer,
      camera
    );

    if (pressable) {
      this.pressDown(pressable, InputSource.Pointer);
    }
  }

  private onPointerUp(): void {
    this.pressables.forEach((pressable) => {
      this.pressUp(pressable, InputSource.Pointer);
    });
  }

  private onPointerMove(
    renderer: THREE.Renderer,
    camera: THREE.PerspectiveCamera,
    event: PointerEvent
  ): void {
    const pressable = ThreeUtils.getObjectAtCoord(
      this.pressables,
      event.clientX,
      event.clientY,
      renderer,
      camera
    );
    renderer.domElement.style.cursor = pressable ? 'pointer' : 'default';

    // If a synthesizer key was previously clicked and the pointer has moved to
    // another key, make that the new "clicked" key. This allows keys to be
    // played in a click + drag manner.
    if (pressable && this.keys.includes(pressable)) {
      const currentKey = this.keys.find((key) => {
        const inputSources = key.userData.inputSources as Set<InputSource>;
        return inputSources.has(InputSource.Pointer);
      });

      if (currentKey && currentKey !== pressable) {
        this.pressUp(currentKey, InputSource.Pointer);
        this.pressDown(pressable, InputSource.Pointer);
      }
    }
  }

  /**
   * Signal the intent from an input source to press an object on the synthesizer.
   *
   * The object will only be pressed if no other input sources are pressing it.
   */
  private pressDown(pressable: THREE.Object3D, inputSource: InputSource): void {
    const inputSources = pressable.userData.inputSources as Set<InputSource>;

    if (inputSources.size === 0) {
      if (this.keys.includes(pressable)) {
        pressable.position.y -= Synthesizer.keyPressHeight;
        this.oscillationGraph.openNoteGate(
          pressable.userData.note as NoteLiteral
        );
      } else if ([this.nextButton, this.previousButton].includes(pressable)) {
        pressable.position.y -= Synthesizer.buttonPressHeight;
        this.clearScreenText();
      }
    }

    inputSources.add(inputSource);
  }

  /**
   * Signal the intent from an input source to unpress an object on the synthesizer.
   *
   * The object will only be unpressed if no other input sources are pressing it.
   */
  private pressUp(pressable: THREE.Object3D, inputSource: InputSource): void {
    const inputSources = pressable.userData.inputSources as Set<InputSource>;

    if (inputSources.size === 1 && inputSources.has(inputSource)) {
      if (this.keys.includes(pressable)) {
        pressable.position.y += Synthesizer.keyPressHeight;
        this.oscillationGraph.closeNoteGate(
          pressable.userData.note as NoteLiteral
        );
      } else if ([this.nextButton, this.previousButton].includes(pressable)) {
        pressable.position.y += Synthesizer.buttonPressHeight;
        const increment = pressable === this.nextButton ? 1 : -1;
        this.oscillatorType = wrapIndex(
          customOscillatorTypes.indexOf(this.oscillatorType) + increment,
          customOscillatorTypes
        );
        this.oscillationGraph.setOscillatorType(this.oscillatorType);
        this.setScreenText();
      }
    }

    inputSources.delete(inputSource);
  }

  private setScreenText(): void {
    this.screenText = new THREE.Mesh();
    this.screenText.geometry = new TextGeometry(
      this.oscillatorType.toUpperCase(),
      {
        font: Synthesizer.assets.font,
        size: 1.5,
        height: 0.1,
      }
    ).center();
    this.screenText.material = new THREE.MeshPhysicalMaterial({
      color: '#ff6600',
      emissive: '#bb3300',
      reflectivity: 0,
      metalness: 0,
    });
    this.screenText.rotation.x = -THREE.MathUtils.degToRad(90);

    const screenHeight = 0.1; // TODO: Instead of hardcoding, calculate screen height in a way that's unaffected by synthesizer rotation.
    const screenTextHeight = ThreeUtils.getObjectSize(this.screenText).height;
    this.screenText.position.x = this.screen.position.x;
    this.screenText.position.y =
      this.screen.position.y + screenHeight / 2 + screenTextHeight / 2;
    this.screenText.position.z = this.screen.position.z;
    this.model.add(this.screenText);
  }

  private clearScreenText(): void {
    if (this.screenText) {
      this.model.remove(this.screenText);
      this.screenText = null;
    }
  }

  private getPressableFromKeyCode(keyCode: string): THREE.Object3D | null {
    switch (keyCode) {
      case 'ArrowRight':
        return this.nextButton;
      case 'ArrowLeft':
        return this.previousButton;
      default: {
        const semitoneKeyCodes = [
          // 1st octave
          'KeyZ',
          'KeyS',
          'KeyX',
          'KeyD',
          'KeyC',
          'KeyV',
          'KeyG',
          'KeyB',
          'KeyH',
          'KeyN',
          'KeyJ',
          'KeyM',
          // 2nd octave
          'KeyE',
          'Digit4',
          'KeyR',
          'Digit5',
          'KeyT',
          'KeyY',
          'Digit7',
          'KeyU',
          'Digit8',
          'KeyI',
          'Digit9',
          'KeyO',
        ];

        const semitone = semitoneKeyCodes.indexOf(keyCode);
        if (semitone >= 0) {
          return this.keys[12 + semitone];
        }

        return null;
      }
    }
  }

  private get pressables(): THREE.Object3D[] {
    return [...this.keys, this.previousButton, this.nextButton];
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

enum InputSource {
  Keyboard = 1,
  Pointer = 2,
}
