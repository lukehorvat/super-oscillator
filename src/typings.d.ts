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
