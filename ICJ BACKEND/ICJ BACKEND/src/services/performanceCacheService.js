/**
 * PerformanceCacheService — Instant In-Memory SWR (Stale-While-Revalidate) Cache Engine
 * Prevents redundant HTTP/Database network fetches, making page navigation instant and lag-free.
 */

const memoryCache = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

const PerformanceCacheService = {
  /**
   * Store data in memory cache with time-to-live (TTL)
   */
  set(key, data, ttlMs = DEFAULT_TTL_MS) {
    const expiresAt = Date.now() + ttlMs;
    memoryCache.set(key, { data, expiresAt });
  },

  /**
   * Retrieve cached data if valid; return null if expired
   */
  get(key) {
    const cached = memoryCache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      memoryCache.delete(key);
      return null;
    }

    return cached.data;
  },

  /**
   * Stale-While-Revalidate execution helper
   */
  async fetchWithCache(key, fetcherFn, ttlMs = DEFAULT_TTL_MS) {
    const cachedData = this.get(key);
    if (cachedData !== null) {
      // Background revalidate asynchronously without blocking UI
      fetcherFn().then((newData) => {
        if (newData) this.set(key, newData, ttlMs);
      }).catch(() => {});

      return cachedData;
    }

    // Fresh fetch if no cache
    const freshData = await fetcherFn();
    if (freshData) {
      this.set(key, freshData, ttlMs);
    }
    return freshData;
  },

  /**
   * Invalidate specific cache key or flush memory
   */
  invalidate(key) {
    if (key) memoryCache.delete(key);
    else memoryCache.clear();
  }
};

export default PerformanceCacheService;
