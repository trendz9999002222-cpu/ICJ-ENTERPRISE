/**
 * ICJ ENTERPRISE PLATFORM
 * OTP Rate Limiting, Request Cooldowns, & Abuse Lockouts
 */

const STORAGE_KEY = "icj_otp_rate_limits";

function getRateLimits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRateLimits(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const OTPRateLimiter = {
  /**
   * Check if a user/identifier is currently rate limited or locked out.
   * @param {string} identifier - Email or phone
   * @param {object} policy - Expiry, cooldown, lockout limits from governance
   * @returns {{allowed: boolean, reason?: string, remainingSeconds?: number}}
   */
  checkRequestLimit(identifier, policy = {}) {
    const data = getRateLimits();
    const now = Date.now();
    const id = String(identifier).trim().toLowerCase();

    const record = data[id] || {
      lastRequestTime: 0,
      requestCount: 0,
      lockoutUntil: 0,
      attempts: 0,
    };

    // 1. Lockout check
    if (record.lockoutUntil > now) {
      const remaining = Math.ceil((record.lockoutUntil - now) / 1000);
      return {
        allowed: false,
        reason: `Account temporarily locked due to excessive requests. Try again in ${remaining} seconds.`,
        remainingSeconds: remaining,
      };
    }

    // 2. Cooldown check
    const cooldownSec = policy.cooldownSeconds || 60;
    const elapsed = Math.floor((now - record.lastRequestTime) / 1000);
    if (record.lastRequestTime > 0 && elapsed < cooldownSec) {
      const remaining = cooldownSec - elapsed;
      return {
        allowed: false,
        reason: `Please wait ${remaining} seconds before requesting another OTP.`,
        remainingSeconds: remaining,
      };
    }

    // 3. Max Request count within window check (e.g. 5 requests max per 15 mins)
    const windowMs = 15 * 60 * 1000;
    const maxRequests = policy.maxRequests || 5;

    // Reset counter if window has elapsed since last request
    if (now - record.lastRequestTime > windowMs) {
      record.requestCount = 0;
    }

    if (record.requestCount >= maxRequests) {
      const lockoutMs = (policy.lockoutDurationMinutes || 15) * 60 * 1000;
      record.lockoutUntil = now + lockoutMs;
      record.requestCount = 0; // reset on lockout trigger
      data[id] = record;
      saveRateLimits(data);

      const remaining = Math.ceil(lockoutMs / 1000);
      return {
        allowed: false,
        reason: `Maximum OTP requests exceeded. Temporary lockout initiated for ${policy.lockoutDurationMinutes || 15} minutes.`,
        remainingSeconds: remaining,
      };
    }

    return { allowed: true };
  },

  /**
   * Record a successful request attempt
   */
  recordRequest(identifier) {
    const data = getRateLimits();
    const now = Date.now();
    const id = String(identifier).trim().toLowerCase();

    const record = data[id] || {
      lastRequestTime: 0,
      requestCount: 0,
      lockoutUntil: 0,
      attempts: 0,
    };

    record.lastRequestTime = now;
    record.requestCount += 1;
    record.attempts = 0; // Reset verification failure count on new request
    data[id] = record;
    saveRateLimits(data);
  },

  /**
   * Check verification attempt limits
   */
  checkVerificationLimit(identifier, policy = {}) {
    const data = getRateLimits();
    const now = Date.now();
    const id = String(identifier).trim().toLowerCase();

    const record = data[id] || {
      lastRequestTime: 0,
      requestCount: 0,
      lockoutUntil: 0,
      attempts: 0,
    };

    if (record.lockoutUntil > now) {
      const remaining = Math.ceil((record.lockoutUntil - now) / 1000);
      return {
        allowed: false,
        reason: `Verification locked. Try again in ${remaining} seconds.`,
        remainingSeconds: remaining,
      };
    }

    const maxAttempts = policy.maxAttempts || 3;
    if (record.attempts >= maxAttempts) {
      const lockoutMs = (policy.lockoutDurationMinutes || 15) * 60 * 1000;
      record.lockoutUntil = now + lockoutMs;
      data[id] = record;
      saveRateLimits(data);

      const remaining = Math.ceil(lockoutMs / 1000);
      return {
        allowed: false,
        reason: `Maximum verification attempts exceeded. Locked out for ${policy.lockoutDurationMinutes || 15} minutes.`,
        remainingSeconds: remaining,
      };
    }

    return { allowed: true };
  },

  /**
   * Record verification failure
   */
  recordVerificationFailure(identifier) {
    const data = getRateLimits();
    const id = String(identifier).trim().toLowerCase();

    if (data[id]) {
      data[id].attempts = (data[id].attempts || 0) + 1;
      saveRateLimits(data);
    }
  },

  /**
   * Reset limits upon successful verification
   */
  resetLimits(identifier) {
    const data = getRateLimits();
    const id = String(identifier).trim().toLowerCase();
    if (data[id]) {
      delete data[id];
      saveRateLimits(data);
    }
  },
};

export default OTPRateLimiter;
