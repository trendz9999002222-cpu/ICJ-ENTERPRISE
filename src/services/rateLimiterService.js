/**
 * ICJ ENTERPRISE RATE LIMITER SERVICE
 * Prevents Brute-Force, Credential Stuffing, and Denial-of-Service (DoS) abuse on critical endpoints.
 */

const STORAGE_KEY = "icj_security_rate_limits";

export const RateLimiterService = {
  getLimitStore() {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveLimitStore(store) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.warn("RateLimiter storage write error:", e.message);
    }
  },

  /**
   * Records a failed attempt for a specific action (e.g. 'login:email', 'otp:phone')
   * Returns: { allowed: boolean, attempts: number, lockUntil: number, remainingCooldownSec: number }
   */
  recordFailedAttempt(actionKey, maxAttempts = 5, baseLockoutMinutes = 15) {
    const store = this.getLimitStore();
    const now = Date.now();
    const entry = store[actionKey] || { attempts: 0, lockUntil: 0, lastAttempt: now };

    // If currently locked, check if lockout expired
    if (entry.lockUntil > now) {
      const remainingSec = Math.ceil((entry.lockUntil - now) / 1000);
      return {
        allowed: false,
        attempts: entry.attempts,
        lockUntil: entry.lockUntil,
        remainingCooldownSec: remainingSec,
        message: `Too many failed attempts. Security cooldown active for ${remainingSec} seconds.`,
      };
    }

    entry.attempts += 1;
    entry.lastAttempt = now;

    // Trigger exponential lockout if threshold reached
    if (entry.attempts >= maxAttempts) {
      const multiplier = Math.pow(2, entry.attempts - maxAttempts);
      const lockoutMs = baseLockoutMinutes * 60 * 1000 * Math.min(multiplier, 8); // Max 2 hours
      entry.lockUntil = now + lockoutMs;
      store[actionKey] = entry;
      this.saveLimitStore(store);

      const remainingSec = Math.ceil(lockoutMs / 1000);
      return {
        allowed: false,
        attempts: entry.attempts,
        lockUntil: entry.lockUntil,
        remainingCooldownSec: remainingSec,
        message: `Account temporarily shielded against brute-force attacks. Please retry in ${Math.ceil(remainingSec / 60)} minutes.`,
      };
    }

    store[actionKey] = entry;
    this.saveLimitStore(store);

    return {
      allowed: true,
      attempts: entry.attempts,
      remainingAttempts: maxAttempts - entry.attempts,
      lockUntil: 0,
      remainingCooldownSec: 0,
    };
  },

  /**
   * Checks if an action is allowed without incrementing
   */
  checkAllowed(actionKey) {
    const store = this.getLimitStore();
    const now = Date.now();
    const entry = store[actionKey];

    if (!entry || !entry.lockUntil || entry.lockUntil <= now) {
      return { allowed: true, remainingCooldownSec: 0 };
    }

    const remainingSec = Math.ceil((entry.lockUntil - now) / 1000);
    return {
      allowed: false,
      remainingCooldownSec: remainingSec,
      message: `Security cooldown active. Please wait ${remainingSec} seconds.`,
    };
  },

  /**
   * Clears attempts upon successful authentication
   */
  resetAttempts(actionKey) {
    const store = this.getLimitStore();
    if (store[actionKey]) {
      delete store[actionKey];
      this.saveLimitStore(store);
    }
  },
};

export default RateLimiterService;
