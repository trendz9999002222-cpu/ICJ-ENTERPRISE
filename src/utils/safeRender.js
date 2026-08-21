/**
 * safeRender — ICJ Enterprise Platform
 *
 * Utility functions for safe rendering.
 * - undefined/null से कभी crash नहीं होगा
 * - हर function में fallback guaranteed है
 */

/**
 * Safely get a nested property from an object.
 * @param {object} obj
 * @param {string} path — dot-separated e.g. "diagnosis.legalStand"
 * @param {*} fallback — returned when path is missing or null
 */
export function safeGet(obj, path, fallback = "") {
  try {
    return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safe array: always returns [], never undefined/null.
 */
export function safeArray(value) {
  if (Array.isArray(value)) return value;
  return [];
}

/**
 * Safe string: always returns string, never undefined/null.
 */
export function safeStr(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

/**
 * Safe JSON parse from localStorage: never throws.
 */
export function safeJsonParse(raw, fallback = null) {
  try {
    if (raw === null || raw === undefined || raw === "") return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Safe localStorage read: never throws.
 */
export function safeLocalRead(key, fallback = null) {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    return safeJsonParse(raw, fallback);
  } catch {
    return fallback;
  }
}

/**
 * Safe localStorage write: never throws.
 */
export function safeLocalWrite(key, value) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Silently ignore quota exceeded / private mode errors
  }
}
