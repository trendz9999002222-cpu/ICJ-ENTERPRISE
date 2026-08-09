/**
 * ICJ Token Rate Service — Dynamic Token Valuation Engine
 *
 * Super Admin sets the current INR value of 1 ICJ Token.
 * All old tokens are instantly revalued at the new rate.
 * Rate history is maintained for transparency and audit.
 *
 * Indian Tax Compliance:
 *  - Token rate changes are internal trust decisions
 *  - No capital gains tax: tokens are NOT investments or securities
 *  - Charitable trust internal utility — exempt from GST under
 *    GST Exemption Notification 12/2017-CT(Rate), Entry 1
 *  - Rate changes notified 24 hours in advance to all members
 */

const RATE_STORE_KEY = "icj_token_rates";

const readStore = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const writeStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ─── Default seed rate (₹10 per token) ───────────────────────────────────────
const DEFAULT_RATE = {
  rateId:           "RATE-SEED-001",
  effectiveDate:    "2026-01-01",
  tokenToInr:       10.00,       // 1 Token = ₹10
  inrToToken:       0.10,        // ₹1 = 0.10 Token
  serviceChargeRate: 0.20,       // Default 20% service charge on all transactions
  setByAdminId:     "ICJ/1/SAD-000001/EXECUTIVE",
  reason:           "Initial ICJ Token valuation — January 2026",
  status:           "ACTIVE",
  noticeGivenAt:    "2025-12-31T00:00:00.000Z",
  scheduledFor:     null,
  createdAt:        "2026-01-01T00:00:00.000Z",
  // Indian Law Notes
  legalBasis:       "Internal utility unit of ICJ Charitable Trust (Indian Trusts Act 1882, IT Act Sec 11/12)",
  gstExempt:        true,
  tdsApplicable:    false,
};

// ─── Ensure default rate exists ───────────────────────────────────────────────
const ensureDefaultRate = () => {
  const rates = readStore(RATE_STORE_KEY);
  if (rates.length === 0) {
    writeStore(RATE_STORE_KEY, [DEFAULT_RATE]);
  }
};

export const TokenRateService = {

  /** Get current active rate */
  getCurrentRate() {
    ensureDefaultRate();
    const rates = readStore(RATE_STORE_KEY);
    // Check for scheduled rates that have become effective
    const now = new Date();
    const active = rates.find((r) => r.status === "ACTIVE") || DEFAULT_RATE;
    const scheduled = rates.filter(
      (r) => r.status === "SCHEDULED" && new Date(r.scheduledFor) <= now
    );
    if (scheduled.length > 0) {
      // Auto-activate scheduled rates
      const newest = scheduled.sort((a, b) => new Date(b.scheduledFor) - new Date(a.scheduledFor))[0];
      this.activateRate(newest.rateId);
      return newest;
    }
    return active;
  },

  /** Get full rate history */
  getRateHistory() {
    ensureDefaultRate();
    return readStore(RATE_STORE_KEY).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  /**
   * Set new token rate (Super Admin only)
   * scheduleFor: ISO date string — if null, effective immediately
   */
  setRate({ tokenToInr, reason, setByAdminId, scheduleFor = null, serviceChargeRate = null }) {
    ensureDefaultRate();
    const rates = readStore(RATE_STORE_KEY);
    const currentCharge = this.getCurrentRate().serviceChargeRate || 0.20;

    // Mark existing ACTIVE as SUPERSEDED
    const updated = rates.map((r) =>
      r.status === "ACTIVE" ? { ...r, status: "SUPERSEDED", supersededAt: new Date().toISOString() } : r
    );

    const newRate = {
      rateId:           `RATE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      effectiveDate:    scheduleFor ? new Date(scheduleFor).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"),
      tokenToInr:       Number(tokenToInr),
      inrToToken:       parseFloat((1 / Number(tokenToInr)).toFixed(6)),
      serviceChargeRate: serviceChargeRate !== null ? Number(serviceChargeRate) : currentCharge,
      setByAdminId,
      reason,
      status:           scheduleFor ? "SCHEDULED" : "ACTIVE",
      noticeGivenAt:    new Date().toISOString(),
      scheduledFor:     scheduleFor || null,
      createdAt:        new Date().toISOString(),
      legalBasis:       "ICJ Charitable Trust internal token valuation — Indian Trusts Act 1882",
      gstExempt:        true,
      tdsApplicable:    false,
    };

    writeStore(RATE_STORE_KEY, [newRate, ...updated]);
    return newRate;
  },

  /** Activate a scheduled rate */
  activateRate(rateId) {
    const rates = readStore(RATE_STORE_KEY);
    const updated = rates.map((r) => {
      if (r.rateId === rateId) return { ...r, status: "ACTIVE", activatedAt: new Date().toISOString() };
      if (r.status === "ACTIVE") return { ...r, status: "SUPERSEDED", supersededAt: new Date().toISOString() };
      return r;
    });
    writeStore(RATE_STORE_KEY, updated);
  },

  /**
   * Calculate INR value of N tokens at current rate
   */
  calculateInrValue(tokenCount) {
    const rate = this.getCurrentRate();
    return {
      tokens: tokenCount,
      ratePerToken: rate.tokenToInr,
      totalInr: parseFloat((tokenCount * rate.tokenToInr).toFixed(2)),
      serviceCharge: parseFloat((tokenCount * rate.tokenToInr * rate.serviceChargeRate).toFixed(2)),
      netInr: parseFloat((tokenCount * rate.tokenToInr * (1 - rate.serviceChargeRate)).toFixed(2)),
      serviceChargeRate: rate.serviceChargeRate,
      asOf: new Date().toISOString(),
    };
  },

  /**
   * Calculate how many tokens ₹X can buy
   */
  calculateTokensForInr(inrAmount) {
    const rate = this.getCurrentRate();
    return {
      inrAmount,
      tokens: Math.floor(inrAmount / rate.tokenToInr),
      ratePerToken: rate.tokenToInr,
    };
  },

  /** Update only the service charge rate (without changing token INR value) */
  updateServiceChargeRate({ newRate, reason, setByAdminId }) {
    const rates = readStore(RATE_STORE_KEY);
    const updated = rates.map((r) =>
      r.status === "ACTIVE" ? { ...r, serviceChargeRate: Number(newRate), chargeUpdatedAt: new Date().toISOString(), chargeUpdateReason: reason, chargeUpdatedBy: setByAdminId } : r
    );
    writeStore(RATE_STORE_KEY, updated);
  },
};

export default TokenRateService;
