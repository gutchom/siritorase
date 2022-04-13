import type { ForwardedRef, RefObject } from 'react';
import { createRef, useEffect, useRef, useState } from 'react';

export type MultipleRef<T> = RefObject<T>[];
export type MultipleForwardedRef<T> = ForwardedRef<MultipleRef<T>>;

export function getRef<T>(
  refs: MultipleForwardedRef<T>,
  index: number,
): RefObject<T> | null {
  return refs && 'current' in refs ? refs.current?.[index] ?? null : null;
}

export default function useMultipleRef<T>(
  length: number,
): [refs: MultipleForwardedRef<T>, content: T[]] {
  const refs = useRef<MultipleRef<T>>(
    Array(length)
      .fill(null) // Do not call "createRef()" here.
      .map(() => createRef<T>()), // "createRef()" should be called in "Array#map()".
  );

  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    setItems(
      refs.current
        .map((ref) => ref.current)
        .filter((item): item is T => item !== null),
    );
  }, [refs]);

  return [refs, items];
}
