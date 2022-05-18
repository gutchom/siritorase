import { useCallback, useEffect, useRef } from 'react';
import isInnerNode from 'lib/isInnerNode';

export default function useOutsideEvent<
  T extends HTMLElement,
  K extends keyof DocumentEventMap,
>(
  eventType: K,
  onOuterClick: (e: DocumentEventMap[K]) => void,
  onInnerClick?: (e: DocumentEventMap[K]) => void,
) {
  const ref = useRef<T>(null);
  const outer = useRef(onOuterClick);
  const inner = useRef(onInnerClick);

  const handler: (e: DocumentEventMap[K]) => void = useCallback(
    (e) => {
      if (ref.current && e.target) {
        if (isInnerNode(ref.current, e.target)) {
          inner.current && inner.current(e);
        } else {
          outer.current(e);
        }
      }
    },
    [ref, outer, inner],
  );

  useEffect(() => {
    document.addEventListener(eventType, handler);
    return () => {
      document.removeEventListener(eventType, handler);
    };
  }, [eventType, handler]);

  return ref;
}
