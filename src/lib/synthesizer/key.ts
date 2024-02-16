import * as THREE from 'three';
import { Note } from 'tonal';

export default class Key extends THREE.Mesh {
  private readonly note: string;

  constructor(note: string) {
    super();

    console.log('!note', note, Note.freq(note));
    this.note = note;
    this.geometry = new THREE.BoxGeometry(10, 5, 50);
    this.material = new THREE.MeshPhysicalMaterial({ color: '#ffffff' });
  }
}
