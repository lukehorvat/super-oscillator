import * as THREE from "three";
import WindowResize from "three-window-resize";
import * as ThreeExtensions from "./three";
import Keyboard from "./keyboard";

let renderer, camera, scene, light, keyboard;

init();
render();

function init() {
  ThreeExtensions.install();

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.querySelector(".app").appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, Number.MAX_SAFE_INTEGER);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 1300;

  WindowResize(renderer, camera); // Automatically handle window resize events.

  scene = new THREE.Scene();

  keyboard = new Keyboard();
  keyboard.bbox.centerX = 0;
  keyboard.bbox.centerY = 600;
  keyboard.bbox.centerZ = 0;
  keyboard.addClickListener(camera);
  scene.add(keyboard);

  light = new THREE.SpotLight("#aaaaaa");
  light.position.x = 0;
  light.position.y = 1000;
  light.position.z = 0;
  scene.add(light);
}

function render() {
  // Queue up the next render.
  requestAnimationFrame(render);

  if (keyboard.bbox.centerY > 0) {
    // Move keyboard until it reaches its resting position.
    keyboard.bbox.centerY -= 4;
  } else if (keyboard.rotation.x < Math.PI / 4) {
    // Rotate keyboard until it reaches its resting position.
    keyboard.rotation.x += Math.PI / 300;
  }

  // Render the scene!
  renderer.render(scene, camera);
}
