/**
 * ICJ ENTERPRISE 500MB+ INDEXED-DB HIGH-CAPACITY STORAGE ENGINE
 * Replaces browser 5MB localStorage limit with multi-hundred megabyte high-speed database.
 * Stores offline case files, full judgments, evidence documents, and cryptographic tokens.
 */

const DB_NAME = "ICJ_ENTERPRISE_VAULT_DB";
const DB_VERSION = 1;
const STORE_NAME = "legal_data_vault";

export const IndexedDBService = {
  dbPromise: null,

  getDB() {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        return reject(new Error("IndexedDB is not supported in this environment"));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  },

  async setItem(key, value) {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put({ key, value, updatedAt: Date.now() });

        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn("IndexedDB setItem error:", e.message);
      return false;
    }
  },

  async getItem(key, defaultValue = null) {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          if (req.result && req.result.value !== undefined) {
            resolve(req.result.value);
          } else {
            resolve(defaultValue);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn("IndexedDB getItem error:", e.message);
      return defaultValue;
    }
  },

  async removeItem(key) {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);

        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn("IndexedDB removeItem error:", e.message);
      return false;
    }
  },

  async clear() {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn("IndexedDB clear error:", e.message);
      return false;
    }
  },
};

export default IndexedDBService;
