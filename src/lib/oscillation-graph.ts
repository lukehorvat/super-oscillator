import { Note, NoteLiteral } from 'tonal';
import Reverb, { ReverbNode } from 'soundbank-reverb';
import oscillators, { CustomOscillatorType } from 'web-audio-oscillators';

export class OscillationGraph {
  private readonly volume: GainNode;
  private readonly reverb: ReverbNode;
  private readonly gatedNotes: Map<NoteLiteral, GatedNote>;

  constructor(notes: NoteLiteral[]) {
    const context = new AudioContext();

    this.reverb = Reverb(context);
    this.reverb.time = 1;
    this.reverb.wet.value = 0.8;
    this.reverb.dry.value = 0.6;
    this.reverb.connect(context.destination);

    this.volume = context.createGain();
    this.volume.gain.value = 0.2; // TODO: Add UI control for this.
    this.volume.connect(this.reverb);

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

  openOscillatorGates(oscillatorType: CustomOscillatorType): void {
    for (const gatedNote of this.gatedNotes.values()) {
      gatedNote.openOscillatorGate(oscillatorType);
    }
  }
}

class GatedNote {
  private readonly gate: GainNode;
  private readonly gatedOscillators: Map<CustomOscillatorType, GatedOscillator>;

  constructor(note: NoteLiteral, outputNode: AudioNode) {
    this.gate = outputNode.context.createGain();
    this.gate.gain.value = 0;
    this.gate.connect(outputNode);

    this.gatedOscillators = (Object.keys(oscillators) as CustomOscillatorType[])
      .slice(0, 4)
      .reduce((map, oscillatorType) => {
        return map.set(
          oscillatorType,
          new GatedOscillator(oscillatorType, Note.freq(note)!, this.gate)
        );
      }, new Map<CustomOscillatorType, GatedOscillator>());
  }

  openGate(): void {
    this.gate.gain.setTargetAtTime(1, this.gate.context.currentTime, 0.02);
  }

  closeGate(): void {
    this.gate.gain.setTargetAtTime(0, this.gate.context.currentTime, 0.01);
  }

  openOscillatorGate(oscillatorType: CustomOscillatorType): void {
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
    oscillatorType: CustomOscillatorType,
    frequency: number,
    outputNode: AudioNode
  ) {
    this.gate = outputNode.context.createGain();
    this.gate.gain.value = 0;
    this.gate.connect(outputNode);

    this.oscillator = oscillators[oscillatorType](outputNode.context);
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
