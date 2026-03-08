'use client';

import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item) as T);
      }
    } catch {
      setValue(initialValue);
    } finally {
      setHydrated(true);
    }
  }, [key, initialValue]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [hydrated, key, value]);

  return { value, setValue, hydrated };
}
