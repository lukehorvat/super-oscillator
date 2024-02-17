import * as THREE from 'three';

/**
 * Of a list of objects, get the closest one intersecting a coordinate.
 */
export function getObjectAtCoord(
  objects: THREE.Object3D[],
  x: number,
  y: number,
  renderer: THREE.Renderer,
  camera: THREE.PerspectiveCamera
): THREE.Object3D | null {
  const pointer = new THREE.Vector2();
  pointer.x = (x / renderer.domElement.clientWidth) * 2 - 1;
  pointer.y = -(y / renderer.domElement.clientHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);

  const intersections = raycaster.intersectObjects(objects);
  return intersections[0]?.object ?? null;
}

/**
 * Center an object (and if it's a THREE.Group, all of its children).
 */
export function centerObject(object: THREE.Object3D): void {
  const bbox = new THREE.Box3().setFromObject(object);
  bbox.getCenter(object.position).multiplyScalar(-1);
}
