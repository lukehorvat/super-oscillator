declare module 'wrap-index' {
  function wrapIndex<T>(index: number, array: T[]): T;
  export default wrapIndex;
}
