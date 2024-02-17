import * as THREE from 'three';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { Synthesizer } from './synthesizer';

export class SceneManager {
  private readonly renderer: THREE.Renderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly clock: THREE.Clock;
  private readonly controls: FlyControls;
  private readonly synthesizer: Synthesizer;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.camera = new THREE.PerspectiveCamera();
    this.camera.fov = 55;
    this.camera.far = 1000;
    this.camera.position.z = 100;
    this.camera.position.y = 50;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.controls = new FlyControls(this.camera, this.renderer.domElement);
    this.controls.dragToLook = true;
    this.controls.movementSpeed = 100;
    this.controls.rollSpeed = 0.4;

    this.synthesizer = new Synthesizer();
    this.synthesizer.addPointerListener(this.renderer, this.camera);
    this.scene.add(this.synthesizer);
    this.camera.lookAt(this.synthesizer.position);

    const ambientLight = new THREE.AmbientLight('#dddddd');
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight('#ffffff');
    this.scene.add(directionalLight);
  }

  render(containerEl: Element): void {
    containerEl.appendChild(this.renderer.domElement);
    requestAnimationFrame(this.animate.bind(this));
  }

  private animate(): void {
    const delta = this.clock.getDelta();
    this.controls.update(delta);
    this.syncRendererSize();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }

  /**
   * Sync the renderer size with the current canvas size.
   */
  private syncRendererSize(): void {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }
}
