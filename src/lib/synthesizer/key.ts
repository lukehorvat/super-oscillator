import * as THREE from 'three';
import { Note } from 'tonal';

export default class Key extends THREE.Mesh {
  private readonly note: string;
  private readonly gateNode: GainNode;

  constructor(note: string, outputNode: AudioNode) {
    super();

    this.note = note;
    this.geometry = new THREE.BoxGeometry(10, 5, 50);
    this.material = new THREE.MeshPhysicalMaterial({ color: '#ffffff' });

    const audioContext = outputNode.context;
    this.gateNode = audioContext.createGain();
    this.gateNode.gain.value = 0;
    this.gateNode.connect(outputNode);

    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = Note.freq(this.note)!;
    oscillator.connect(this.gateNode);
    oscillator.start();
  }

  press(): void {
    this.gateNode.gain.setTargetAtTime(
      1,
      this.gateNode.context.currentTime,
      0.02
    );
  }

  release(): void {
    this.gateNode.gain.setTargetAtTime(
      0,
      this.gateNode.context.currentTime,
      0.01
    );
  }
}
