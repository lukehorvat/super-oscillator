import { Note, NoteLiteral } from 'tonal';
import Reverb, { ReverbNode } from 'soundbank-reverb';
import oscillators, { CustomOscillatorType } from 'web-audio-oscillators';

export class OscillationGraph {
  private readonly volume: GainNode;
  private readonly reverb: ReverbNode;
  private readonly noteGates: Map<NoteLiteral, GainNode>;
  private readonly noteOscillators: Map<NoteLiteral, OscillatorNode>;

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

    this.noteGates = notes.reduce((map, note) => {
      const noteGate = context.createGain();
      noteGate.gain.value = 0;
      noteGate.connect(this.volume);
      return map.set(note, noteGate);
    }, new Map<NoteLiteral, GainNode>());

    this.noteOscillators = new Map<NoteLiteral, OscillatorNode>();
  }

  openNoteGate(note: NoteLiteral): void {
    const noteGate = this.noteGates.get(note)!;
    noteGate.gain.setTargetAtTime(1, noteGate.context.currentTime, 0.02);
  }

  closeNoteGate(note: NoteLiteral): void {
    const noteGate = this.noteGates.get(note)!;
    noteGate.gain.setTargetAtTime(0, noteGate.context.currentTime, 0.01);
  }

  rebuildOscillators(oscillatorType: CustomOscillatorType): void {
    for (const [note, noteGate] of this.noteGates) {
      // Destroy current oscillator.
      let noteOscillator = this.noteOscillators.get(note);
      if (noteOscillator) {
        noteOscillator.stop();
        noteOscillator.disconnect(noteGate);
      }

      // Replace with new oscillator.
      noteOscillator = oscillators[oscillatorType](noteGate.context);
      noteOscillator.frequency.value = Note.freq(note)!;
      noteOscillator.connect(noteGate);
      noteOscillator.start();
      this.noteOscillators.set(note, noteOscillator);
    }
  }
}
