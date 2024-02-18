import * as THREE from 'three';
import { Synthesizer } from './synthesizer';

export class SceneManager {
  private readonly renderer: THREE.Renderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly clock: THREE.Clock;
  private readonly synthesizer: Synthesizer;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.camera = new THREE.PerspectiveCamera();
    this.camera.fov = 20;
    this.camera.position.y = 80;
    this.camera.position.z = 50;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.synthesizer = new Synthesizer();
    this.synthesizer.addPointerListener(this.renderer, this.camera);
    this.scene.add(this.synthesizer);
    this.camera.lookAt(this.synthesizer.position);

    const ambientLight = new THREE.AmbientLight('#ffffff');
    this.scene.add(ambientLight);

    const spotLight = new THREE.SpotLight('#ffffff');
    spotLight.position.y = 80;
    spotLight.position.z = -40;
    spotLight.decay = 0;
    spotLight.intensity = 1 * Math.PI;
    this.scene.add(spotLight);
  }

  render(containerEl: Element): void {
    containerEl.appendChild(this.renderer.domElement);
    requestAnimationFrame(this.animate.bind(this));
  }

  private animate(): void {
    // const delta = this.clock.getDelta();
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
