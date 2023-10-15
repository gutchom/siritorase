export default function store<T>(storage: Storage, key: string) {
  function get(): T | null {
    return JSON.parse(storage.getItem(key)!);
  }

  function set(update: T | ((old: T | null) => T)): void {
    storage.set(
      JSON.stringify(update instanceof Function ? update(get()) : update),
    );
  }

  return [get, set] as const;
}
