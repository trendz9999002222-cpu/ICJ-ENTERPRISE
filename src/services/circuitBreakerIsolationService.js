/**
 * ICJ ENTERPRISE AUTOMATED CIRCUIT BREAKER & COMPARTMENTALIZED ISOLATION SERVICE
 * Automatically locks the 3 High-Risk Attack Vectors during a Critical RED Alert:
 * 1. New Onboarding & Public Signups (/join, /register) -> FROZEN
 * 2. New File Uploads & AI Drafting (/documents, /ai-drafter) -> READ-ONLY VAULT
 * 3. Outgoing Financial Transfers & Token Exchange (/wallet) -> FINANCIAL LOCK
 * Leaves Public Case Lookups (/track-case) & Admin Console 100% operational.
 */

const CIRCUIT_BREAKER_KEY = "icj_circuit_breaker_isolation_state";

export const CircuitBreakerIsolationService = {
  getState() {
    if (typeof window === "undefined") {
      return { active: false, mode: "NORMAL_ALL_OPEN", signupsLocked: false, fileUploadsLocked: false, financeLocked: false };
    }
    try {
      const raw = localStorage.getItem(CIRCUIT_BREAKER_KEY);
      return raw
        ? JSON.parse(raw)
        : { active: false, mode: "NORMAL_ALL_OPEN", signupsLocked: false, fileUploadsLocked: false, financeLocked: false };
    } catch {
      return { active: false, mode: "NORMAL_ALL_OPEN", signupsLocked: false, fileUploadsLocked: false, financeLocked: false };
    }
  },

  saveState(state) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CIRCUIT_BREAKER_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Circuit breaker save error:", e.message);
    }
  },

  /**
   * Activates compartmentalized circuit breaker lockdown on 3 high-risk vectors
   */
  tripCircuitBreaker(reason = "Critical Security Alert Triggered") {
    const newState = {
      active: true,
      mode: "COMPARTMENTALIZED_ISOLATION_ACTIVE",
      signupsLocked: true,
      fileUploadsLocked: true,
      financeLocked: true,
      trippedAt: new Date().toISOString(),
      reason,
    };
    this.saveState(newState);
    return newState;
  },

  /**
   * Restores normal operations when security is 100% verified and restored
   */
  restoreNormalOperations() {
    const newState = {
      active: false,
      mode: "NORMAL_ALL_OPEN",
      signupsLocked: false,
      fileUploadsLocked: false,
      financeLocked: false,
      restoredAt: new Date().toISOString(),
    };
    this.saveState(newState);
    return newState;
  },

  /**
   * Route guard checks
   */
  isSignupAllowed() {
    return !this.getState().signupsLocked;
  },

  isFileUploadAllowed() {
    return !this.getState().fileUploadsLocked;
  },

  isFinanceAllowed() {
    return !this.getState().financeLocked;
  },
};

export default CircuitBreakerIsolationService;
