import type { ForwardedRef, MutableRefObject, RefObject } from 'react';
import { createRef, useEffect, useRef, useState } from 'react';

export type MultipleRef<T> = RefObject<T>[];

export const getRef = <T>(
  refs: ForwardedRef<MultipleRef<T>>,
  index: number,
): RefObject<T> | null =>
  refs && 'current' in refs ? refs.current && refs.current[index] : null;

export default function useMultipleRef<T>(
  length: number,
): [MutableRefObject<MultipleRef<T>>, T[]] {
  const refs = useRef(Array<RefObject<T>>(length).fill(createRef<T>()));
  const [values, setValues] = useState<T[]>([]);
  useEffect(() => {
    setValues(
      refs.current
        .map((ref) => ref.current)
        .filter((item): item is T => item !== null),
    );
  }, [refs]);

  return [refs, values];
}
