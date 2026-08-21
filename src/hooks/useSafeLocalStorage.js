/**
 * useSafeLocalStorage — ICJ Enterprise Platform
 *
 * Universal hook: reads/writes localStorage safely.
 * - कभी crash नहीं करता (try/catch everywhere)
 * - हमेशा valid defaultValue return करता है
 * - Storage events पर auto-sync (cross-tab)
 */
import { useState, useEffect, useCallback } from "react";

export function useSafeLocalStorage(key, defaultValue) {
  const readValue = useCallback(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      if (item === null || item === undefined) return defaultValue;
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  }, [key]);

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = useCallback(
    (value) => {
      if (typeof window === "undefined") return;
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch {
        // Silently ignore storage errors
      }
    },
    [key, storedValue]
  );

  // Sync across tabs via storage event
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === key) setStoredValue(readValue());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, readValue]);

  return [storedValue, setValue];
}

export default useSafeLocalStorage;
