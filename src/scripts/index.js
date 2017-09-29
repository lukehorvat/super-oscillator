import * as THREE from "three";
import WindowResize from "three-window-resize";
import * as ThreeExtensions from "./three";
import Keyboard from "./keyboard";

let renderer, camera, scene, light, title, fork, keyboard;

init().then(render);

function init() {
  return Keyboard.init().then(() => {
    ThreeExtensions.install();

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, Number.MAX_SAFE_INTEGER);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 1300;

    WindowResize(renderer, camera); // Automatically handle window resize events.

    scene = new THREE.Scene();

    light = new THREE.SpotLight("#aaaaaa");
    light.position.x = 0;
    light.position.y = 1000;
    light.position.z = 0;
    scene.add(light);

    title = new THREE.Mesh();
    title.material = new THREE.MeshToonMaterial({ color: "#3a3a3a", transparent: true, opacity: 0 });
    title.geometry = new THREE.TextGeometry("SYNTHESIZER", { font: Keyboard.font, size: 70, height: 1 });
    title.bbox.centerX = 0;
    title.bbox.centerY = 200;
    title.bbox.centerZ = 0;
    scene.add(title);

    fork = new THREE.Mesh();
    fork.material = new THREE.MeshToonMaterial({ color: "#3a3a3a", transparent: true, opacity: 0 });
    fork.geometry = new THREE.TextGeometry("Fork me on GitHub", { font: Keyboard.font, size: 20, height: 1 });
    fork.bbox.centerX = 0;
    fork.bbox.centerY = -200;
    fork.bbox.centerZ = 0;
    window.addEventListener("click", event => {
      let x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      let y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
      let raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      if (raycaster.ray.intersectsBox(fork.bbox.bbox.world)) {
        window.location.href = "https://github.com/lukehorvat/synthesizer";
      }
    });
    scene.add(fork);

    keyboard = new Keyboard();
    keyboard.bbox.centerX = 0;
    keyboard.bbox.centerY = 600;
    keyboard.bbox.centerZ = 0;
    keyboard.addClickListener(renderer, camera);
    scene.add(keyboard);
  });
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
  } else {
    if (title.material.opacity < 1) {
      // Fade-in title.
      title.material.opacity += 0.01;
    }

    if (fork.material.opacity < 1) {
      // Fade-in fork link.
      fork.material.opacity += 0.01;
    }
  }

  // Render the scene!
  renderer.render(scene, camera);
}
