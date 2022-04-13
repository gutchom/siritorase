import type { ForwardedRef, RefObject } from 'react';
import { createRef, useRef } from 'react';

export function getRef<T>(refs: ForwardedRef<RefObject<T>[]>, index: number) {
  return refs && 'current' in refs ? refs.current?.[index] : null;
}

export default function useMultipleRef<T>(
  length: number,
): [refs: ForwardedRef<RefObject<T>[]>, items: T[]] {
  const refs = useRef<RefObject<T>[]>(
    Array(length)
      .fill(null) // Do not call "createRef()" here.
      .map(() => createRef<T>()), // "createRef()" should be called in "Array#map()".
  );
  const items = refs.current
    .map((ref) => ref.current)
    .filter((item): item is T => item != null);

  return [refs, items];
}
