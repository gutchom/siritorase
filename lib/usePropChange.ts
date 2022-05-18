import { useEffect } from 'react';

export default function usePropChange<T>(
  prop: T,
  callback: (nextProp: T) => void,
) {
  useEffect(() => callback(prop), [prop, callback]);
}
