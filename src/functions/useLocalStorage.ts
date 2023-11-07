import { useSyncExternalStore } from 'react';

export default function useLocalStorage<T extends object>(
  key: string,
): [T, (update: T | ((old: T) => T)) => void] {
  const current = useSyncExternalStore(subscribe, get);

  function subscribe(callback: () => void) {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  }

  function get(): T {
    return JSON.parse(localStorage.getItem(key)!);
  }

  function set(update: T | ((old: T) => T)): void {
    const value = typeof update === 'function' ? update(current) : update;
    const json = JSON.stringify(value);
    localStorage.setItem(key, json);
  }

  return [current, set];
}
