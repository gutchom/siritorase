import { useSyncExternalStore } from 'react';
import store from './store';

export default function useLocalStorage<T>(
  storage: Storage,
  key: string,
): [T | null, (update: T | ((old: T | null) => T)) => void] {
  const [get, set] = store<T>(storage, key);
  const current = useSyncExternalStore(subscribe, get);

  function subscribe(callback: () => void) {
    window.addEventListener('storage', handler);

    return () => window.removeEventListener('storage', handler);

    function handler(e: StorageEvent): void {
      if (
        e.storageArea === storage &&
        e.key === key &&
        e.newValue !== e.oldValue
      ) {
        callback();
      }
    }
  }

  return [current, set];
}
