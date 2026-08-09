/**
 * ICJ Transaction Charge Service — Universal Service Charge Engine
 *
 * Every token transaction attracts a service charge (default 20%) on the
 * current INR value of tokens being transacted.
 * Charge is collected by ICJ Trust Treasury.
 *
 * Indian Tax & Legal Compliance:
 *  - Service charge collected by ICJ Charitable Trust = Voluntary Contribution
 *  - Eligible for 80G deduction if donor opts to treat it as donation
 *  - GST: Charitable trusts are exempt from GST on activities incidental to
 *    charitable purposes — Notification 12/2017-CT(Rate), Sr. No. 1
 *  - TDS u/s 194J (professional fees) NOT applicable as ICJ is not providing
 *    professional services — it is facilitating internal barter among members
 *  - Income of charitable trust exempt u/s 11 & 12 of Income Tax Act, 1961
 *    subject to compliance with conditions therein
 *  - No Securities Transaction Tax (STT) — tokens are NOT listed securities
 *  - No Stamp Duty — token transfers are not conveyances of immovable property
 *
 * Fluctuating Charge Rate:
 *  Super Admin can change the default rate at any time.
 *  24-hour advance notice is given to all members.
 *  Charge rate at time of transaction is locked in the ledger permanently.
 */

import TokenRateService from "./tokenRateService";

const CHARGE_LOG_KEY = "icj_charge_log";
const CHARGE_POLICY_KEY = "icj_charge_policy";

const readStore = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const writeStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ─── Charge Policy (fluctuating) ─────────────────────────────────────────────
const DEFAULT_POLICY = {
  defaultRate:        0.20,   // 20% default
  campaignRate:       0.10,   // 10% for social welfare campaigns
  donorGrantRate:     0.15,   // 15% for donor → public grant transfers
  otcExchangeRate:    0.25,   // 25% for high-value OTC exchange
  minimumChargeInr:   5.00,   // Minimum charge ₹5 regardless of tokens
  chargeRecipient:    "ICJ_TREASURY",
  gstOnCharge:        false,  // Charitable trust — GST exempt
  tdsOnCharge:        false,  // Not professional fee — no TDS
  updatedAt:          new Date().toISOString(),
  updatedBy:          "SYSTEM",
  legalNote:          "Service charge = voluntary contribution to ICJ Charitable Trust (Reg. under Indian Trusts Act 1882). 80G eligible.",
};

const getPolicy = () => {
  const stored = localStorage.getItem(CHARGE_POLICY_KEY);
  return stored ? { ...DEFAULT_POLICY, ...JSON.parse(stored) } : DEFAULT_POLICY;
};

// ─── Transaction Types ────────────────────────────────────────────────────────
export const TRANSACTION_TYPES = {
  MEMBER_TO_MEMBER:   "MEMBER_TO_MEMBER",  // Regular P2P transfer
  DONOR_GRANT:        "DONOR_GRANT",       // Donor distributing to public
  CAMPAIGN_REWARD:    "CAMPAIGN_REWARD",   // Campaign work reward (low charge)
  OTC_EXCHANGE:       "OTC_EXCHANGE",      // High-value exchange
  REDEMPTION:         "REDEMPTION",        // Redeeming for service/cash
  ESCROW_ISSUE:       "ESCROW_ISSUE",      // Issuing event-locked tokens (no charge)
  WELCOME_GRANT:      "WELCOME_GRANT",     // Welcome demo tokens (no charge)
};

export const TransactionChargeService = {

  /** Get current charge policy */
  getPolicy() {
    return getPolicy();
  },

  /** Update charge policy (Super Admin only) */
  updatePolicy({ defaultRate, campaignRate, donorGrantRate, otcExchangeRate, updatedBy, reason }) {
    const current = getPolicy();
    const updated = {
      ...current,
      ...(defaultRate !== undefined && { defaultRate: Number(defaultRate) }),
      ...(campaignRate !== undefined && { campaignRate: Number(campaignRate) }),
      ...(donorGrantRate !== undefined && { donorGrantRate: Number(donorGrantRate) }),
      ...(otcExchangeRate !== undefined && { otcExchangeRate: Number(otcExchangeRate) }),
      updatedAt: new Date().toISOString(),
      updatedBy,
      lastChangeReason: reason,
    };
    localStorage.setItem(CHARGE_POLICY_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Calculate charge for a transaction
   * Returns a breakdown: grossValue, chargeRate, chargeInr, chargeTokens, netInr, netTokens
   */
  calculateCharge({ tokenAmount, transactionType = TRANSACTION_TYPES.MEMBER_TO_MEMBER }) {
    const policy = getPolicy();
    const rate = TokenRateService.getCurrentRate();
    const grossInr = tokenAmount * rate.tokenToInr;

    // Determine applicable charge rate
    let chargeRate = policy.defaultRate;
    if (transactionType === TRANSACTION_TYPES.CAMPAIGN_REWARD) chargeRate = policy.campaignRate;
    else if (transactionType === TRANSACTION_TYPES.DONOR_GRANT) chargeRate = policy.donorGrantRate;
    else if (transactionType === TRANSACTION_TYPES.OTC_EXCHANGE) chargeRate = policy.otcExchangeRate;
    else if ([TRANSACTION_TYPES.WELCOME_GRANT, TRANSACTION_TYPES.ESCROW_ISSUE].includes(transactionType)) {
      chargeRate = 0; // No charge on welcome tokens or escrow issuance
    }

    const chargeInr = Math.max(
      parseFloat((grossInr * chargeRate).toFixed(2)),
      chargeRate > 0 ? policy.minimumChargeInr : 0
    );
    const chargeTokens = Math.ceil(chargeInr / rate.tokenToInr);
    const netInr = parseFloat((grossInr - chargeInr).toFixed(2));
    const netTokens = tokenAmount - chargeTokens;

    return {
      tokenAmount,
      grossInr,
      chargeRate,
      chargeRatePct: `${(chargeRate * 100).toFixed(0)}%`,
      chargeInr,
      chargeTokens,
      netInr,
      netTokens: Math.max(netTokens, 0),
      tokenRateUsed: rate.tokenToInr,
      transactionType,
      // Tax compliance fields
      gstOnCharge: false,
      tdsOnCharge: false,
      chargeNature: "Voluntary contribution to ICJ Trust — 80G eligible",
      chargeRecipient: policy.chargeRecipient,
      calculatedAt: new Date().toISOString(),
    };
  },

  /**
   * Record a completed transaction charge in the charge log
   */
  recordCharge({
    transactionId,
    fromMemberId,
    toMemberId,
    tokenAmount,
    transactionType,
    chargeBreakdown,
    agreementId = null,
  }) {
    const log = readStore(CHARGE_LOG_KEY);
    const record = {
      chargeId: `CHG-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      transactionId,
      fromMemberId,
      toMemberId,
      tokenAmount,
      transactionType,
      ...chargeBreakdown,
      agreementId,
      collectedAt: new Date().toISOString(),
      collectedTo: "ICJ_TREASURY",
      // Tax receipt metadata
      receiptNo: `ICJ-CHG-${new Date().getFullYear()}-${String(log.length + 1).padStart(5, "0")}`,
      taxYear: `AY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      donorCanClaim80G: true,
      gst: { applicable: false, reason: "Charitable trust exemption — Notif. 12/2017-CT(Rate)" },
      tds: { applicable: false, reason: "Internal barter facilitation — not professional service fee" },
    };
    writeStore(CHARGE_LOG_KEY, [record, ...log]);
    return record;
  },

  /** Get charge log for a member */
  getChargeLogForMember(memberId) {
    return readStore(CHARGE_LOG_KEY).filter(
      (c) => c.fromMemberId === memberId || c.toMemberId === memberId
    );
  },

  /** Get total charges collected (Treasury revenue) */
  getTotalChargesCollected() {
    const log = readStore(CHARGE_LOG_KEY);
    return log.reduce((sum, c) => sum + (c.chargeInr || 0), 0);
  },

  /** Get charge stats */
  getStats() {
    const log = readStore(CHARGE_LOG_KEY);
    return {
      totalCharges: log.length,
      totalInrCollected: log.reduce((s, c) => s + (c.chargeInr || 0), 0),
      totalTokensCollected: log.reduce((s, c) => s + (c.chargeTokens || 0), 0),
      byType: Object.fromEntries(
        Object.values(TRANSACTION_TYPES).map((type) => [
          type,
          log.filter((c) => c.transactionType === type).reduce((s, c) => s + (c.chargeInr || 0), 0),
        ])
      ),
    };
  },
};

export default TransactionChargeService;
