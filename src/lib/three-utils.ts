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
 * Center an object.
 */
export function centerObject(object: THREE.Object3D): void {
  const bbox = new THREE.Box3().setFromObject(object);
  bbox.getCenter(object.position).multiplyScalar(-1);
}

/**
 * Calculate the size of an object.
 */
export function getObjectSize(object: THREE.Object3D): {
  width: number;
  height: number;
  depth: number;
} {
  const bbox = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  return { width: size.x, height: size.y, depth: size.z };
}

/**
 * Calculate the distance from the camera to a specified frustum width.
 */
export function getDistanceToFrustumWidth(
  width: number,
  camera: THREE.PerspectiveCamera
): number {
  const height = width / camera.aspect;
  return getDistanceToFrustumHeight(height, camera);
}

/**
 * Calculate the distance from the camera to a specified frustum height.
 */
export function getDistanceToFrustumHeight(
  height: number,
  camera: THREE.PerspectiveCamera
): number {
  const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  return height / (tan * 2);
}

/**
 * Calculate the frustum size at a specified distance from the camera.
 */
export function getFrustumSizeAtDistance(
  distance: number,
  camera: THREE.PerspectiveCamera
): {
  width: number;
  height: number;
} {
  const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  const height = tan * 2 * distance;
  const width = height * camera.aspect;
  return { width, height };
}
