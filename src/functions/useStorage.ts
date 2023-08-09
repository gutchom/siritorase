import { useEffect, useSyncExternalStore } from 'react';

type Initializer<T> = () => T;
type Initial<T> = T | Initializer<T>;
type Updater<T> = (value: T) => T;
type Update<T> = T | Updater<T>;
type Setter<T> = (update: Update<T>) => void;
type Return<T> = [T, Setter<T>];

export function useLocalStorage<T>(key: string, init: Initial<T>): Return<T> {
  return useStorage(localStorage, key, init);
}

export function useSessionStorage<T>(key: string, init: Initial<T>): Return<T> {
  return useStorage(sessionStorage, key, init);
}

function useStorage<T>(
  storage: Storage,
  key: string,
  init: Initial<T>,
): Return<T> {
  const value = useSyncExternalStore(subscribe, get);

  useEffect(() => {
    if (isInitializer<T>(init)) {
      set(init());
    } else {
      set(init);
    }
  }, [init]);

  function subscribe(callback: () => void) {
    window.addEventListener('storage', handler);

    return () => window.removeEventListener('storage', handler);

    function handler(e: StorageEvent) {
      if (e.storageArea === storage && e.key === key) callback();
    }
  }

  function get(): T {
    const json = storage.getItem(key);
    if (!json) throw new Error(`storage "${key}" is empty`);

    return JSON.parse(json);
  }

  function set(update: T | ((value: T) => T)) {
    const item = isUpdater<T>(update) ? update(get()) : update;
    storage.setItem(key, JSON.stringify(item));
  }

  return [value, set];
}

function isUpdater<T>(updater: unknown): updater is Updater<T> {
  return typeof updater === 'function' && updater.length === 1;
}

function isInitializer<T>(initializer: unknown): initializer is Initializer<T> {
  return typeof initializer === 'function' && initializer.length === 0;
}
