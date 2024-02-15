import * as THREE from 'three';
import Synthesizer from './synthesizer';

export class SceneManager {
  private readonly renderer: THREE.Renderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly clock: THREE.Clock;
  private readonly synthesizer: Synthesizer;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.camera = new THREE.PerspectiveCamera();
    this.camera.fov = 55;
    this.camera.far = this.camera.position.z = 1000;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.synthesizer = new Synthesizer();
    this.scene.add(this.synthesizer);
  }

  render(containerEl: Element): void {
    containerEl.appendChild(this.renderer.domElement);
    requestAnimationFrame(this.animate.bind(this));
  }

  private animate(): void {
    // const delta = this.clock.getDelta();
    // this.syncRendererSize();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }
}
