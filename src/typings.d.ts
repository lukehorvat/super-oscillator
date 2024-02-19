declare module 'soundbank-reverb' {
  export type ReverbNode = GainNode & {
    readonly wet: AudioParam;
    readonly dry: AudioParam;
    readonly cutoff: AudioParam;
    filterType: BiquadFilterType;
    time: number;
    decay: number;
    reverse: boolean;
  };

  function Reverb(context: BaseAudioContext): ReverbNode;
  export default Reverb;
}

declare module 'wrap-index' {
  function wrapIndex<T>(index: number, array: T[]): T;
  export default wrapIndex;
}

declare module 'web-audio-oscillators' {
  export type CustomOscillatorType =
    | 'sine'
    | 'square'
    | 'square2'
    | 'sawtooth'
    | 'triangle'
    | 'triangle2'
    | 'chiptune'
    | 'organ'
    | 'organ2'
    | 'organ3'
    | 'organ4'
    | 'organ5'
    | 'bass'
    | 'bass2'
    | 'bass3'
    | 'bass4'
    | 'brass'
    | 'brass2'
    | 'aah'
    | 'ooh'
    | 'eeh'
    | 'buzz'
    | 'buzz2'
    | 'dissonance';

  const oscillators: {
    [T in CustomOscillatorType]: (context: BaseAudioContext) => OscillatorNode;
  };

  export default oscillators;
}
