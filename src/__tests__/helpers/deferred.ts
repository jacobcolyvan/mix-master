// Manually resolved promises for holding a boundary open in race tests.
// Tests decide when to release it; no timers, rejection API or import-time hooks.
export const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
