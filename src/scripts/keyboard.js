import * as THREE from "three";

export default class extends THREE.Group {
  constructor(keyCount = 35, keyWidth = 40, keyHeight = 30, keyDepth = 500, keyPadding = 4) {
    super();

    for (let i = 0; i < keyCount; i++) {
      let key = new THREE.Mesh();
      key.geometry = new THREE.BoxGeometry(keyWidth, keyHeight, keyDepth);
      key.material = new THREE.MeshToonMaterial({ color: "#ffffff" });
      key.position.x = i * (keyWidth + keyPadding);
      key.position.y = 0;
      key.position.z = 0;
      this.add(key);
    }
  }

  get boundingBox() {
    return new THREE.Box3().setFromObject(this);
  }
}
