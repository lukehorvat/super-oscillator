import { Note, NoteLiteral } from 'tonal';

// TODO: Replace with web-audio-oscillators
const OSCILLATORS: OscillatorType[] = [
  'sawtooth',
  'sine',
  'square',
  'triangle',
];

export class OscillationGraph {
  private readonly volume: GainNode;
  private readonly gatedNotes: Map<NoteLiteral, GatedNote>;

  constructor(notes: NoteLiteral[]) {
    const context = new AudioContext();

    this.volume = context.createGain();
    this.volume.gain.value = 0.2; // TODO: Add UI control for this.
    this.volume.connect(context.destination);

    this.gatedNotes = notes.reduce((map, note) => {
      return map.set(note, new GatedNote(note, this.volume));
    }, new Map<NoteLiteral, GatedNote>());
  }

  openNoteGate(note: NoteLiteral): void {
    this.gatedNotes.get(note)!.openGate();
  }

  closeNoteGate(note: NoteLiteral): void {
    this.gatedNotes.get(note)!.closeGate();
  }

  openOscillatorGates(oscillatorType: OscillatorType): void {
    for (const gatedNote of this.gatedNotes.values()) {
      gatedNote.openOscillatorGate(oscillatorType);
    }
  }
}

class GatedNote {
  private readonly gate: GainNode;
  private readonly gatedOscillators: Map<OscillatorType, GatedOscillator>;

  constructor(note: NoteLiteral, outputNode: AudioNode) {
    this.gate = outputNode.context.createGain();
    this.gate.gain.value = 0;
    this.gate.connect(outputNode);

    this.gatedOscillators = OSCILLATORS.reduce((map, oscillatorType) => {
      return map.set(
        oscillatorType,
        new GatedOscillator(oscillatorType, Note.freq(note)!, this.gate)
      );
    }, new Map<OscillatorType, GatedOscillator>());
  }

  openGate(): void {
    this.gate.gain.setTargetAtTime(1, this.gate.context.currentTime, 0.02);
  }

  closeGate(): void {
    this.gate.gain.setTargetAtTime(0, this.gate.context.currentTime, 0.01);
  }

  openOscillatorGate(oscillatorType: OscillatorType): void {
    for (const [type, gatedOscillator] of this.gatedOscillators) {
      if (oscillatorType === type) {
        gatedOscillator.openGate();
      } else {
        gatedOscillator.closeGate();
      }
    }
  }
}

class GatedOscillator {
  private readonly gate: GainNode;
  private readonly oscillator: OscillatorNode;

  constructor(
    oscillatorType: OscillatorType,
    frequency: number,
    outputNode: AudioNode
  ) {
    this.gate = outputNode.context.createGain();
    this.gate.gain.value = 0;
    this.gate.connect(outputNode);

    this.oscillator = outputNode.context.createOscillator();
    this.oscillator.type = oscillatorType;
    this.oscillator.frequency.value = frequency;
    this.oscillator.connect(this.gate);
    this.oscillator.start();
  }

  openGate(): void {
    this.gate.gain.setTargetAtTime(1, this.gate.context.currentTime, 0.02);
  }

  closeGate(): void {
    this.gate.gain.setTargetAtTime(0, this.gate.context.currentTime, 0.01);
  }
}
