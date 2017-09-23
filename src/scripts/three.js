/*
  A module providing custom extensions to three.js!
*/

import * as THREE from "three";

class BoundingBox {
  constructor(object) {
    this.object = object;
  }

  /*
    A function that determines the bounding box of the object. Since Box3.setFromObject()
    computes the bounding box at a "world" level, it includes any x/y/z rotations applied
    to the object (even if they were applied indirectly via a parent object). These
    rotations alter the width, height, and depth of the bounding box. Therefore, we must
    temporarily remove the rotations in order to determine the "local" bounding box.
  */
  get bbox() {
    return this.withoutRotation(() => {
      let world = new THREE.Box3().setFromObject(this.object);
      let local = new THREE.Box3(
        this.object.worldToLocal(world.min.clone()),
        this.object.worldToLocal(world.max.clone()),
      );

      return { world, local };
    });
  }

  get position() {
    let world = this.object.getWorldPosition();
    let local = this.object.worldToLocal(world.clone());

    return { world, local };
  }

  get width() {
    return Math.abs(this.bbox.local.min.x - this.bbox.local.max.x);
  }

  get height() {
    return Math.abs(this.bbox.local.min.y - this.bbox.local.max.y);
  }

  get depth() {
    return Math.abs(this.bbox.local.min.z - this.bbox.local.max.z);
  }

  get minX() {
    return this.object.position.x - Math.abs(this.position.local.x - this.bbox.local.min.x);
  }

  set minX(x) {
    this.object.position.x = x + Math.abs(this.object.position.x - this.minX);
  }

  get maxX() {
    return this.minX + this.width;
  }

  set maxX(x) {
    this.minX = x - this.width;
  }

  get centerX() {
    return this.minX + (this.width / 2);
  }

  set centerX(x) {
    this.minX = x - (this.width / 2);
  }

  get minY() {
    return this.object.position.y - Math.abs(this.position.local.y - this.bbox.local.min.y);
  }

  set minY(y) {
    this.object.position.y = y + Math.abs(this.object.position.y - this.minY);
  }

  get maxY() {
    return this.minY + this.height;
  }

  set maxY(y) {
    this.minY = y - this.height;
  }

  get centerY() {
    return this.minY + (this.height / 2);
  }

  set centerY(y) {
    this.minY = y - (this.height / 2);
  }

  get minZ() {
    return this.object.position.z - Math.abs(this.position.local.z - this.bbox.local.min.z);
  }

  set minZ(z) {
    this.object.position.z = z + Math.abs(this.object.position.z - this.minZ);
  }

  get maxZ() {
    return this.minZ + this.depth;
  }

  set maxZ(z) {
    this.minZ = z - this.depth;
  }

  get centerZ() {
    return this.minZ + (this.depth / 2);
  }

  set centerZ(z) {
    this.minZ = z - (this.depth / 2);
  }

  /*
    A function that allows you to perform some unit of "work" while all of the object's
    x/y/z rotations are temporarily disabled.
  */
  withoutRotation(fn) {
    // Clear object rotation.
    let rotation = this.object.rotation.clone();
    let worldRotation = this.object.getWorldRotation();
    this.object.setRotationFromEuler(worldRotation.inverted());

    // Work!
    let value = fn();

    // Restore object rotation.
    this.object.setRotationFromEuler(rotation);

    return value;
  }
}

export function install() {
  Object.defineProperty(THREE.Object3D.prototype, "bbox", {
    get: function() {
      return new BoundingBox(this);
    }
  });

  Object.defineProperty(THREE.Euler.prototype, "inverted", {
    value: function() {
      return new this.constructor(-this.x, -this.y, -this.z);
    }
  });
}
