import * as THREE from 'three';
import * as ThreeUtils from './three-utils';
import { Synthesizer } from './synthesizer';

export class SceneManager {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly clock: THREE.Clock;
  private readonly synthesizer: Synthesizer;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera = new THREE.PerspectiveCamera();
    this.camera.fov = 20;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.synthesizer = new Synthesizer();
    this.scene.add(this.synthesizer);

    const ambientLight = new THREE.AmbientLight('#ffffff');
    this.scene.add(ambientLight);

    const spotLight = new THREE.SpotLight('#ffffff');
    spotLight.position.y = 300;
    spotLight.position.z = 40;
    spotLight.decay = 0;
    spotLight.intensity = 1 * Math.PI;
    this.scene.add(spotLight);
  }

  render(containerEl: Element): void {
    containerEl.appendChild(this.renderer.domElement);
    requestAnimationFrame(this.animate.bind(this));
  }

  /**
   * Render the current frame.
   */
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    this.syncRendererSize();
    this.rotateSynthesizerUntilRest(delta);
    this.maintainSafeCameraDistance();

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Rotate the synthesizer until it reaches its resting position.
   */
  private rotateSynthesizerUntilRest(delta: number): void {
    const restRotation = THREE.MathUtils.degToRad(45);

    if (this.synthesizer.rotation.x === restRotation) {
      return;
    }

    this.synthesizer.rotation.x = Math.min(
      this.synthesizer.rotation.x + THREE.MathUtils.degToRad(15) * delta,
      restRotation
    );

    // Enable input now if the resting position was just reached.
    if (this.synthesizer.rotation.x === restRotation) {
      this.synthesizer.addInputListener(this.renderer, this.camera);
    }
  }

  /**
   * Position the camera at a distance that allows the entire width of the
   * synthesizer to be visible.
   */
  private maintainSafeCameraDistance(): void {
    const { width } = ThreeUtils.getObjectSize(this.synthesizer);
    const padding = 5; // Some padding for a bit of empty space on the sides...
    const distance = ThreeUtils.getDistanceToFrustumWidth(
      width + padding,
      this.camera
    );
    this.camera.position.z = distance;
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
