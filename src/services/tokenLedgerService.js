/**
 * ICJ Token Ledger Service — Serial Token Engine
 *
 * Each token carries a unique serial ID: ICJ-TOK-XXXXXX
 * Tokens never get destroyed — they circulate perpetually.
 * Every movement is recorded in an immutable ledger.
 *
 * Indian Law Compliance:
 *  - Tokens are internal utility units of a charitable trust (Indian Trusts Act, 1882)
 *  - NOT a financial instrument / security / cryptocurrency
 *  - NOT subject to SEBI regulations (not a listed/unlisted security)
 *  - NOT subject to RBI crypto guidelines (internal organizational barter)
 *  - Service charges qualify as voluntary contributions to trust (Sec 11/12 IT Act)
 */

const STORE_KEY = "icj_token_ledger";
const COUNTER_KEY = "icj_token_serial_counter";

const readStore = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const writeStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ─── Token Types ─────────────────────────────────────────────────────────────
export const TOKEN_TYPES = {
  WELCOME_DEMO:        "WELCOME_DEMO",        // Free onboarding tokens
  WORK_REWARD:         "WORK_REWARD",         // Issued for pro-bono / volunteer work
  CAMPAIGN_EARN:       "CAMPAIGN_EARN",       // Earned via ICJ campaigns
  DONOR_GRANT:         "DONOR_GRANT",         // Donor purchased and distributed
  SUBSCRIPTION_PAY:    "SUBSCRIPTION_PAY",   // Used to pay for subscription
  SERVICE_REDEEM:      "SERVICE_REDEEM",      // Used for AI tools / trust services
  CASH_REDEEM:         "CASH_REDEEM",         // Queued for cash reimbursement
  TRANSFER:            "TRANSFER",            // P2P portal-verified transfer
  CONDITIONAL_ESCROW:  "CONDITIONAL_ESCROW",  // Event-locked (case-linked)
  EXCHANGE:            "EXCHANGE",            // OTC exchange between members
  CHARGE:              "CHARGE",              // ICJ service charge collected
};

// ─── Token Status ─────────────────────────────────────────────────────────────
export const TOKEN_STATUS = {
  ACTIVE:    "ACTIVE",    // In circulation
  LOCKED:    "LOCKED",    // Event-locked (escrow)
  REDEEMED:  "REDEEMED",  // Used for service/cash
  TREASURY:  "TREASURY",  // Back in ICJ Treasury pool
  PENDING:   "PENDING",   // Awaiting confirmation
};

// ─── Generate next serial number ─────────────────────────────────────────────
const nextSerialNumber = () => {
  const current = parseInt(localStorage.getItem(COUNTER_KEY) || "0", 10);
  const next = current + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return `ICJ-TOK-${String(next).padStart(6, "0")}`;
};

// ─── Core Ledger Entry Schema ─────────────────────────────────────────────────
const createLedgerEntry = ({
  tokenSerial,
  tokenType,
  amount = 1,
  fromMemberId = "ICJ_TREASURY",
  toMemberId,
  caseRefCode = null,
  triggerEvent = null,
  description = "",
  chargeRate = 0,
  chargeAmount = 0,
  agreementId = null,
  issuedByAdminId = null,
  inrValueAtIssuance = 0,
  status = TOKEN_STATUS.ACTIVE,
}) => ({
  id: `LED-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  tokenSerial,
  tokenType,
  amount,
  fromMemberId,
  toMemberId,
  currentHolder: toMemberId,
  caseRefCode,           // e.g. "LKO-PROP-2026-0042"
  triggerEvent,          // e.g. "CASE_RESOLVED"
  description,
  chargeRate,            // e.g. 0.20 for 20%
  chargeAmount,          // INR amount of charge
  agreementId,           // TUA document ID
  issuedByAdminId,
  inrValueAtIssuance,    // INR value at time of issuance
  status,
  timestamp: new Date().toISOString(),
  date: new Date().toLocaleDateString("en-IN"),
  // Indian Tax Compliance metadata
  taxCategory: "CHARITABLE_TRUST_INTERNAL",  // Not a taxable financial instrument
  gstApplicable: false,                       // Charitable trust — GST exempt on internal tokens
  tdsApplicable: false,                       // Internal utility unit — no TDS
  legalNote: "ICJ Token is a social obligation instrument of a charitable trust. Not a security, currency, or financial product.",
});

// ─── Public API ───────────────────────────────────────────────────────────────

export const TokenLedgerService = {

  /** Get all ledger entries */
  getAll() {
    return readStore(STORE_KEY);
  },

  /** Get entries for a specific member (as holder or recipient) */
  getForMember(memberId) {
    return readStore(STORE_KEY).filter(
      (e) => e.toMemberId === memberId || e.currentHolder === memberId
    );
  },

  /** Get current token balance for a member */
  getMemberBalance(memberId) {
    const entries = readStore(STORE_KEY);
    let balance = 0;
    entries.forEach((e) => {
      if (e.currentHolder === memberId && e.status === TOKEN_STATUS.ACTIVE) {
        balance += Number(e.amount || 0);
      }
    });
    return balance;
  },

  /** Get locked (escrow) tokens for a member */
  getMemberLockedTokens(memberId) {
    return readStore(STORE_KEY).filter(
      (e) => e.currentHolder === memberId && e.status === TOKEN_STATUS.LOCKED
    );
  },

  /** Get circulation stats (for Public Dashboard) */
  getCirculationStats() {
    const entries = readStore(STORE_KEY);
    const stats = {
      totalMinted: 0,
      totalActive: 0,
      totalLocked: 0,
      totalRedeemed: 0,
      totalInTreasury: 0,
      totalChargeColl: 0,
    };
    entries.forEach((e) => {
      const amt = Number(e.amount || 0);
      if (e.tokenType === TOKEN_TYPES.WELCOME_DEMO ||
          e.fromMemberId === "ICJ_TREASURY") stats.totalMinted += amt;
      if (e.status === TOKEN_STATUS.ACTIVE) stats.totalActive += amt;
      if (e.status === TOKEN_STATUS.LOCKED) stats.totalLocked += amt;
      if (e.status === TOKEN_STATUS.REDEEMED) stats.totalRedeemed += amt;
      if (e.status === TOKEN_STATUS.TREASURY) stats.totalInTreasury += amt;
      if (e.tokenType === TOKEN_TYPES.CHARGE) stats.totalChargeColl += amt;
    });
    return stats;
  },

  /**
   * MINT — Issue new tokens from Treasury
   * Only callable by Super Admin
   */
  mint({ toMemberId, amount, tokenType = TOKEN_TYPES.WORK_REWARD, description = "", issuedByAdminId, inrValueAtIssuance = 0, caseRefCode = null, triggerEvent = null }) {
    const entries = [];
    for (let i = 0; i < amount; i++) {
      const serial = nextSerialNumber();
      const entry = createLedgerEntry({
        tokenSerial: serial,
        tokenType,
        amount: 1,
        fromMemberId: "ICJ_TREASURY",
        toMemberId,
        caseRefCode,
        triggerEvent,
        description,
        issuedByAdminId,
        inrValueAtIssuance,
        status: triggerEvent ? TOKEN_STATUS.LOCKED : TOKEN_STATUS.ACTIVE,
      });
      entries.push(entry);
    }
    const ledger = readStore(STORE_KEY);
    writeStore(STORE_KEY, [...entries, ...ledger]);
    return entries;
  },

  /**
   * TRANSFER — Move tokens between members (portal-verified)
   * Service charge is applied by TransactionChargeService before calling this.
   */
  transfer({ fromMemberId, toMemberId, amount, description = "", agreementId = null, chargeRate = 0, chargeAmount = 0 }) {
    const ledger = readStore(STORE_KEY);
    const activeTokens = ledger.filter(
      (e) => e.currentHolder === fromMemberId && e.status === TOKEN_STATUS.ACTIVE
    ).slice(0, amount);

    if (activeTokens.length < amount) {
      throw new Error(`Insufficient tokens. Available: ${activeTokens.length}, Requested: ${amount}`);
    }

    const updated = ledger.map((e) => {
      const match = activeTokens.find((t) => t.id === e.id);
      if (!match) return e;
      return {
        ...e,
        currentHolder: toMemberId,
        tokenType: TOKEN_TYPES.TRANSFER,
        chargeRate,
        chargeAmount,
        agreementId,
        description,
        transferredAt: new Date().toISOString(),
        custodyHistory: [...(e.custodyHistory || [e.fromMemberId, e.toMemberId]), toMemberId],
      };
    });
    writeStore(STORE_KEY, updated);
    return { success: true, transferredCount: amount };
  },

  /**
   * UNLOCK Escrow — Unlock event-locked tokens when trigger event fires
   */
  unlockEscrow({ caseRefCode, unlockedByAdminId }) {
    const ledger = readStore(STORE_KEY);
    let unlockCount = 0;
    const updated = ledger.map((e) => {
      if (e.caseRefCode === caseRefCode && e.status === TOKEN_STATUS.LOCKED) {
        unlockCount++;
        return {
          ...e,
          status: TOKEN_STATUS.ACTIVE,
          unlockedOn: new Date().toISOString(),
          unlockedByAdminId,
        };
      }
      return e;
    });
    writeStore(STORE_KEY, updated);
    return { success: true, unlockedCount: unlockCount };
  },

  /**
   * REDEEM — Mark tokens as redeemed (service or cash)
   */
  redeem({ memberId, amount, redemptionType, description = "" }) {
    const ledger = readStore(STORE_KEY);
    const active = ledger.filter(
      (e) => e.currentHolder === memberId && e.status === TOKEN_STATUS.ACTIVE
    ).slice(0, amount);

    if (active.length < amount) throw new Error("Insufficient active tokens to redeem.");

    const updated = ledger.map((e) => {
      if (active.find((t) => t.id === e.id)) {
        return {
          ...e,
          status: TOKEN_STATUS.REDEEMED,
          tokenType: redemptionType === "CASH" ? TOKEN_TYPES.CASH_REDEEM : TOKEN_TYPES.SERVICE_REDEEM,
          currentHolder: "ICJ_TREASURY",
          redeemedAt: new Date().toISOString(),
          description,
        };
      }
      return e;
    });
    writeStore(STORE_KEY, updated);
    return { success: true, redeemedCount: amount };
  },

  /** Clear all — development only */
  _devClearAll() {
    writeStore(STORE_KEY, []);
    localStorage.removeItem(COUNTER_KEY);
  },
};

export default TokenLedgerService;
