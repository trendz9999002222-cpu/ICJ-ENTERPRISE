/**
 * ICJ Conditional Token Service — Event-Locked Escrow Token Engine
 *
 * Issues tokens linked to a specific court case / legal event.
 * Tokens remain LOCKED until the trigger event is marked as resolved.
 * Case Reference Code format: CITY-TYPE-YEAR-SERIAL (e.g. LKO-PROP-2026-0042)
 *
 * Indian Law Compliance:
 *  - Escrow tokens are contingent social obligations, NOT securities
 *  - No SEBI registration required (not a Collective Investment Scheme)
 *  - Trust acts as a facilitating intermediary — Indian Contract Act, 1872 Sec 31
 *    (Contingent Contract: "valid when event happens")
 *  - If event does not occur, token holder has no legal remedy (social promise only)
 *  - This is disclosed in TUA (Token User Agreement) signed by all parties
 */

import TokenLedgerService, { TOKEN_TYPES, TOKEN_STATUS } from "./tokenLedgerService";
import TokenRateService from "./tokenRateService";

const ESCROW_STORE_KEY = "icj_escrow_tokens";
const readStore = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const writeStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ─── Case Types ───────────────────────────────────────────────────────────────
export const CASE_TYPES = {
  PROP: "PROP",   // Property / Real Estate
  CRIM: "CRIM",   // Criminal
  CIVIL: "CIVIL", // Civil
  FAM: "FAM",     // Family / Matrimonial
  LAB: "LAB",     // Labour / Employment
  CORP: "CORP",   // Corporate / Commercial
  CONS: "CONS",   // Consumer
  TAX: "TAX",     // Tax / Revenue
  ENV: "ENV",     // Environment
  GEN: "GEN",     // General
};

// ─── Court City Codes ─────────────────────────────────────────────────────────
export const COURT_CITIES = {
  LKO: "Lucknow", DEL: "Delhi", MUM: "Mumbai", BOM: "Bombay",
  CHN: "Chennai", HYD: "Hyderabad", BLR: "Bangalore", KOL: "Kolkata",
  AHM: "Ahmedabad", JAI: "Jaipur", PAT: "Patna", RAN: "Ranchi",
  GWL: "Gwalior", IND: "Indore", NGP: "Nagpur", PNE: "Pune",
  AGR: "Agra", VNS: "Varanasi", PYG: "Prayagraj", MRT: "Meerut",
};

// ─── Trigger Events ───────────────────────────────────────────────────────────
export const TRIGGER_EVENTS = {
  CASE_RESOLVED:       "CASE_RESOLVED",        // Court decision / case settled
  PROPERTY_CLEARED:    "PROPERTY_CLEARED",     // Property dispute resolved
  PAYMENT_RECEIVED:    "PAYMENT_RECEIVED",     // Client paid agreed fee
  DONATION_ARRIVED:    "DONATION_ARRIVED",     // ICJ treasury received donation
  CAMPAIGN_COMPLETED:  "CAMPAIGN_COMPLETED",  // Campaign work fully verified
  MUTUAL_AGREEMENT:    "MUTUAL_AGREEMENT",    // Both parties agreed
  ADMIN_UNLOCK:        "ADMIN_UNLOCK",        // Super Admin emergency unlock
};

// ─── Generate Case Reference Code ────────────────────────────────────────────
const generateCaseRefCode = (cityCode, caseType) => {
  const year = new Date().getFullYear();
  const escrows = readStore(ESCROW_STORE_KEY);
  const serial = String(
    escrows.filter((e) => e.caseRefCode.includes(`${cityCode}-${caseType}-${year}`)).length + 1
  ).padStart(4, "0");
  return `${cityCode}-${caseType}-${year}-${serial}`;
};

export const ConditionalTokenService = {

  /** Get all escrow token records */
  getAll() {
    return readStore(ESCROW_STORE_KEY);
  },

  /** Get all escrow tokens for a specific member */
  getForMember(memberId) {
    return readStore(ESCROW_STORE_KEY).filter((e) => e.issuedToMemberId === memberId);
  },

  /** Get by case reference code */
  getByCaseRef(caseRefCode) {
    return readStore(ESCROW_STORE_KEY).filter((e) => e.caseRefCode === caseRefCode);
  },

  /**
   * ISSUE Event-Locked Escrow Tokens
   * Tokens go to advocate's wallet but are LOCKED until trigger event.
   */
  issue({
    issuedToMemberId,
    tokenAmount,
    cityCode,
    caseType,
    caseTitle,
    clientName,
    advocateName,
    triggerEvent,
    promisedPercentage = null,    // e.g. 10 (meaning 10% of case value)
    promisedCaseValue = null,     // e.g. 5000000 (₹50 lakh)
    issuedByAdminId,
    agreedByClientId = null,
    twoPartyAgreement = false,
    customCaseRefCode = null,
  }) {
    const rate = TokenRateService.getCurrentRate();
    const inrValue = tokenAmount * rate.tokenToInr;
    const caseRefCode = customCaseRefCode || generateCaseRefCode(cityCode, caseType);

    const escrowRecord = {
      id: `ESC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      caseRefCode,
      cityCode,
      caseType,
      caseTitle,
      clientName,
      advocateName,
      issuedToMemberId,
      agreedByClientId,
      tokenAmount,
      inrValueAtIssuance: inrValue,
      rateAtIssuance: rate.tokenToInr,
      promisedPercentage,
      promisedCaseValue,
      triggerEvent,
      twoPartyAgreement,        // Was TUA signed by both parties?
      issuedByAdminId,
      status: TOKEN_STATUS.LOCKED,
      issuedAt: new Date().toISOString(),
      unlockedAt: null,
      unlockedByAdminId: null,
      resolvedEventDetails: null,
      redemptionChoice: null,    // "CASH" | "SERVICE" | "DONATE" | "HOLD"
      // Legal Compliance
      legalNature: "CONTINGENT_SOCIAL_OBLIGATION",
      indianContractActRef: "Section 31 — Contingent Contract",
      noLegalClaimOnAdverse: true,
      sebiExempt: true,
      rbiCryptoExempt: true,
      gstExempt: true,
      tdsOnCashRedemption: "TDS u/s 194A may apply if cash redemption exceeds ₹40,000/year from trust",
    };

    // Save escrow record
    const escrows = readStore(ESCROW_STORE_KEY);
    writeStore(ESCROW_STORE_KEY, [escrowRecord, ...escrows]);

    // Mint LOCKED tokens into advocate's wallet via TokenLedgerService
    TokenLedgerService.mint({
      toMemberId: issuedToMemberId,
      amount: tokenAmount,
      tokenType: TOKEN_TYPES.CONDITIONAL_ESCROW,
      description: `Escrow: ${caseTitle} [${caseRefCode}]`,
      issuedByAdminId,
      inrValueAtIssuance: rate.tokenToInr,
      caseRefCode,
      triggerEvent,
    });

    return escrowRecord;
  },

  /**
   * RESOLVE — Mark a case as resolved → Auto-unlock all linked LOCKED tokens
   */
  resolve({ caseRefCode, resolvedByAdminId, resolvedEventDetails = "" }) {
    const escrows = readStore(ESCROW_STORE_KEY);
    const updated = escrows.map((e) => {
      if (e.caseRefCode === caseRefCode && e.status === TOKEN_STATUS.LOCKED) {
        return {
          ...e,
          status: TOKEN_STATUS.ACTIVE,
          unlockedAt: new Date().toISOString(),
          unlockedByAdminId: resolvedByAdminId,
          resolvedEventDetails,
        };
      }
      return e;
    });
    writeStore(ESCROW_STORE_KEY, updated);

    // Unlock in token ledger too
    const result = TokenLedgerService.unlockEscrow({ caseRefCode, unlockedByAdminId: resolvedByAdminId });
    return { ...result, caseRefCode };
  },

  /** Record advocate's redemption choice after unlock */
  recordRedemptionChoice({ caseRefCode, issuedToMemberId, choice }) {
    const valid = ["CASH", "SERVICE", "DONATE", "HOLD"];
    if (!valid.includes(choice)) throw new Error(`Invalid choice. Must be one of: ${valid.join(", ")}`);

    const escrows = readStore(ESCROW_STORE_KEY);
    const updated = escrows.map((e) => {
      if (e.caseRefCode === caseRefCode && e.issuedToMemberId === issuedToMemberId) {
        return { ...e, redemptionChoice: choice, choiceRecordedAt: new Date().toISOString() };
      }
      return e;
    });
    writeStore(ESCROW_STORE_KEY, updated);
    return { success: true, choice };
  },

  /** Get summary stats */
  getStats() {
    const escrows = readStore(ESCROW_STORE_KEY);
    return {
      total: escrows.length,
      locked: escrows.filter((e) => e.status === TOKEN_STATUS.LOCKED).length,
      unlocked: escrows.filter((e) => e.status === TOKEN_STATUS.ACTIVE).length,
      totalTokensLocked: escrows.filter((e) => e.status === TOKEN_STATUS.LOCKED)
        .reduce((s, e) => s + e.tokenAmount, 0),
      totalInrLocked: escrows.filter((e) => e.status === TOKEN_STATUS.LOCKED)
        .reduce((s, e) => s + e.inrValueAtIssuance, 0),
    };
  },
};

export default ConditionalTokenService;
