import * as THREE from 'three';
import * as ThreeUtils from './three-utils';
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
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.synthesizer = new Synthesizer();
    this.synthesizer.addPointerListener(this.renderer, this.camera);
    this.scene.add(this.synthesizer);

    const ambientLight = new THREE.AmbientLight('#ffffff');
    this.scene.add(ambientLight);

    const spotLight = new THREE.SpotLight('#ffffff');
    spotLight.position.y = 300;
    spotLight.position.z = 30;
    spotLight.decay = 0;
    spotLight.intensity = 1 * Math.PI;
    this.scene.add(spotLight);
  }

  render(containerEl: Element): void {
    containerEl.appendChild(this.renderer.domElement);
    requestAnimationFrame(this.animate.bind(this));
  }

  private animate(): void {
    const delta = this.clock.getDelta();
    this.animateSynthesizer(delta);
    this.syncRendererSize();
    this.syncCameraDistance();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }

  /**
   * Move the synthesizer until it reaches its resting position.
   */
  private animateSynthesizer(delta: number): void {
    if (this.synthesizer.rotation.x < THREE.MathUtils.degToRad(45)) {
      this.synthesizer.rotation.x += THREE.MathUtils.degToRad(15) * delta;
    }
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

  /**
   * Position the camera at a distance that allows the entire width of the
   * synthesizer to be visible.
   */
  private syncCameraDistance(): void {
    const { width } = ThreeUtils.getObjectSize(this.synthesizer);
    const padding = 10; // Some padding for a bit of empty space on the sides...
    const distance = ThreeUtils.getDistanceToFrustumWidth(
      width + padding,
      this.camera
    );
    this.camera.position.z = distance;
  }
}
