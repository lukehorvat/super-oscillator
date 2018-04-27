import * as THREE from "three";
import WindowResize from "three-window-resize";
import * as ThreeExtensions from "./three";
import Synthesizer from "./synthesizer";

let renderer, camera, scene, clock, light, synthesizer;

init().then(render);

function init() {
  return Synthesizer.init().then(() => {
    ThreeExtensions.install();

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector(".app").appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(30, renderer.domElement.clientWidth / renderer.domElement.clientHeight, 1, Number.MAX_SAFE_INTEGER);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 1300;

    WindowResize(renderer, camera); // Automatically handle window resize events.

    scene = new THREE.Scene();

    clock = new THREE.Clock();

    light = new THREE.SpotLight("#aaaaaa");
    light.position.x = 0;
    light.position.y = 1000;
    light.position.z = 0;
    scene.add(light);

    let visibleRect = camera.visibleRect(0);

    synthesizer = new Synthesizer({
      width: visibleRect.width * 0.8,
      height: visibleRect.width * 0.07,
      depth: visibleRect.width * 0.15,
    });
    synthesizer.bbox.centerX = 0;
    synthesizer.bbox.minY = visibleRect.max.y;
    synthesizer.bbox.centerZ = 0;
    synthesizer.addInputListener(renderer, camera);
    scene.add(synthesizer);
  });
}

function render() {
  let delta = clock.getDelta();

  if (synthesizer.bbox.centerY > 0) {
    // Move synthesizer until it reaches its resting position.
    synthesizer.bbox.centerY -= 150 * delta;
  } else if (synthesizer.rotation.x < THREE.Math.degToRad(45)) {
    // Rotate synthesizer until it reaches its resting position.
    synthesizer.rotation.x += THREE.Math.degToRad(20) * delta;
  }

  // Render the scene!
  renderer.render(scene, camera);

  // Queue up the next render.
  requestAnimationFrame(render);
}

// Google Analytics.
(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,"script","https://www.google-analytics.com/analytics.js","ga");
ga("create", "UA-24505142-7", "auto");
ga("send", "pageview");
