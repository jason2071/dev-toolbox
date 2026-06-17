import { useEffect, useRef, useState } from "react";
import { get, set } from "idb-keyval";

// useIdbState is a useState backed by IndexedDB (via idb-keyval), so a tool's
// inputs survive reloads. Reads are async: the value starts at `initial`, then
// the stored value (if any) loads in. Writes are debounced-free, fire-and-forget.
export function useIdbState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);

  // Load once on mount (or when key changes).
  useEffect(() => {
    let active = true;
    loaded.current = false;
    get<T>(key)
      .then((stored) => {
        if (active && stored !== undefined) setValue(stored);
      })
      .catch(() => {})
      .finally(() => {
        if (active) loaded.current = true;
      });
    return () => {
      active = false;
    };
  }, [key]);

  // Persist on change — but not before the initial load, so we never clobber
  // a stored value with the default.
  useEffect(() => {
    if (!loaded.current) return;
    set(key, value).catch(() => {});
  }, [key, value]);

  return [value, setValue] as const;
}
