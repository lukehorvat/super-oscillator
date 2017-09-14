import * as THREE from "three";
import WindowResize from "three-window-resize";
import Keyboard from "./keyboard";

const appEl = document.querySelector(".app");
const fieldOfView = 40;
const drawDistance = 1000;

let renderer, camera, scene, light, keyboard;

init();
render();

function init() {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  appEl.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(fieldOfView, window.innerWidth / window.innerHeight, 1, drawDistance);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = drawDistance;

  WindowResize(renderer, camera); // Automatically handle window resize events.

  scene = new THREE.Scene();

  keyboard = new Keyboard();
  keyboard.position.x = (keyboard.boundingBox.min.x - keyboard.boundingBox.max.x) / 2; // Center it!
  keyboard.position.y = 600;
  keyboard.position.z = keyboard.boundingBox.max.z;
  keyboard.addClickListener(camera);
  scene.add(keyboard);

  light = new THREE.DirectionalLight("#ffffff");
  scene.add(light);
}

function render() {
  // Queue up the next render.
  requestAnimationFrame(render);

  if (keyboard.position.y > 0) {
    // Move keyboard until it reaches its resting position.
    keyboard.position.y -= 4;
  } else if (keyboard.rotation.x < Math.PI / 3) {
    // Rotate keyboard until it reaches its resting position.
    keyboard.rotation.x += Math.PI / 300;
  }

  // Render the scene!
  renderer.render(scene, camera);
}
