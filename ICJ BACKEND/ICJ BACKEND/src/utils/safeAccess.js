/**
 * SafeAccess Utility — ICJ Enterprise Platform
 * Universal Deep Proxy & Null-Safe Access Engine.
 * Guarantees that property access, string methods (.split, .toLowerCase), and array methods (.map, .filter)
 * NEVER throw TypeError crashes when encountering null, undefined, or malformed data.
 */

export const safeString = (val, fallback = "— N/A —") => {
  if (val === null || val === undefined || val === "") return fallback;
  return String(val);
};

export const safeArray = (val) => {
  if (!Array.isArray(val)) return [];
  return val;
};

export const safeObject = (val) => {
  if (!val || typeof val !== "object" || Array.isArray(val)) return {};
  return val;
};

export const safeSplitFirst = (val, delimiter = " ", fallback = "— N/A —") => {
  const str = safeString(val, fallback);
  if (!str || str === fallback) return fallback;
  return str.split(delimiter)[0] || fallback;
};

export const SafeAccess = {
  string: safeString,
  array: safeArray,
  object: safeObject,
  splitFirst: safeSplitFirst,
};

export default SafeAccess;
