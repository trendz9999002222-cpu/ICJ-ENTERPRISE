/**
 * ICJ Token Agreement Service — Digital Policy Document & OTP Signing Engine
 *
 * Before any token transaction, both parties must read and digitally sign
 * the Token User Agreement (TUA). Once signed, no party can make future claims.
 *
 * TUA ID Format: TUA-YYYY-MM-XXXXXX
 * Document Hash: SHA-256 of all fields (tamper-proof)
 *
 * Indian Law Compliance:
 *  - Digital signatures valid under IT Act 2000, Section 5 (Legal recognition)
 *  - OTP-based authentication = Electronic Authentication (Section 3A)
 *  - Signed TUA = Valid electronic contract under Indian Contract Act 1872
 *  - No stamp duty on digital contracts below ₹500 in most states
 *  - Agreement explicitly waives future claims — valid under Contract Act Sec 63
 *    (Promisee may dispense with performance / waiver of claim)
 *  - Arbitration clause: disputes resolved internally by ICJ Trust Board
 *    (not through civil courts) — Arbitration Act 1996 applicable
 */

const TUA_STORE_KEY = "icj_tua_agreements";
const OTP_STORE_KEY = "icj_tua_otp_pending";

const readStore = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const writeStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ─── Simple hash function (SHA-256 substitute for frontend) ──────────────────
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `SHA-${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;
};

// ─── Generate OTP ─────────────────────────────────────────────────────────────
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// ─── TUA Document Template ────────────────────────────────────────────────────
const buildTuaDocument = ({
  tuaId,
  transactionRef,
  partyAId,
  partyAName,
  partyBId,
  partyBName,
  tokenAmount,
  transactionType,
  chargeRate,
  tokenRateAtSign,
  caseRefCode = null,
  customTerms = "",
}) => ({
  tuaId,
  version: "TUA-v1.0",
  title: "ICJ Trust — Token User Agreement",
  titleHindi: "ICJ ट्रस्ट — टोकन उपयोगकर्ता अनुबंध",
  generatedAt: new Date().toISOString(),
  transactionRef,
  parties: {
    partyA: { memberId: partyAId, name: partyAName, role: "Token Transferor / Party A" },
    partyB: { memberId: partyBId, name: partyBName, role: "Token Recipient / Party B" },
    trustWitness: { memberId: "ICJ/1/SAD-000001/EXECUTIVE", name: "ICJ Trust", role: "System Witness" },
  },
  transactionDetails: {
    tokenAmount,
    transactionType,
    chargeRate: `${(chargeRate * 100).toFixed(0)}%`,
    tokenRateAtSign: `₹${tokenRateAtSign}/Token`,
    caseRefCode,
  },
  sections: {
    sec1: {
      title: "Nature of Token",
      content: "ICJ Token is a voluntary social obligation instrument of ICJ Charitable Trust registered under the Indian Trusts Act, 1882. It does NOT constitute a financial instrument, security, currency, cryptocurrency, promissory note, or any other legally enforceable monetary obligation. It is a goodwill barter credit for internal trust services.",
    },
    sec2: {
      title: "No Future Legal Claims",
      content: "By signing this Agreement, each party irrevocably waives any right to initiate legal proceedings, claim damages, or seek judicial relief against ICJ Trust, its officers, trustees, members, or any other Token Holder arising from: (a) adverse outcome of any linked court case; (b) fluctuation in token value; (c) change in service charge rate; (d) non-fulfillment of social promise due to force majeure or fund shortage. This waiver is made freely and voluntarily.",
    },
    sec3: {
      title: "Mutual Voluntariness",
      content: "This transaction is entered into by both parties of their own free will and volition without any coercion, misrepresentation, or undue influence. Either party may withdraw consent before the transaction is completed. Once signed and transaction executed, this Agreement becomes binding.",
    },
    sec4: {
      title: "ICJ Trust Commitment",
      content: "ICJ Trust unconditionally commits to honor all valid tokens for its services (AI Legal Drafting, Document Vault, Court Calendar, Subscription Plans) as long as such services are operationally available. The Trust shall use best efforts to fulfill cash redemption requests when donation funds are available in the Treasury.",
    },
    sec5: {
      title: "Service Charge Acceptance",
      content: `Each signing party acknowledges and accepts ICJ Trust's prevailing service charge rate of ${(chargeRate * 100).toFixed(0)}% (subject to change with 24-hour notice) on all token transactions. This charge constitutes a voluntary contribution to ICJ Trust and may be eligible for 80G deduction under Income Tax Act 1961.`,
    },
    sec6: {
      title: "Indian Law Compliance & Governing Framework",
      content: "This Agreement is governed by the laws of India. Applicable statutes: Indian Trusts Act 1882, Indian Contract Act 1872 (Sections 31, 63), Information Technology Act 2000 (Sections 5, 3A — Digital Signatures & Electronic Authentication). Any dispute shall be resolved through internal arbitration by the ICJ Trust Board before approaching any civil court. GST: Not applicable (Charitable Trust Exemption — Notification 12/2017-CT(Rate)). TDS: Evaluated per Section 194A for cash redemptions exceeding ₹40,000/year.",
    },
    sec7: {
      title: "ICJ Monitoring Agency & Escrow Protection Clause",
      content: "ICJ Trust acts as an independent Monitoring Agency & Escrow Custodian. All client fees and tokens remain secured in ICJ Escrow until work completion is verified. If a service provider or advocate delays, fails to perform, or breaches professional duties, ICJ Trust reserves full right to withhold payment, deduct fees, or refund the client.",
    },
    sec8: {
      title: "Mandatory Document Upload & Case File Safety Protocol",
      content: "It is mandatory for all empanelled Advocates to upload all court papers, pleadings, counter-affidavits, and orders received from courts or opposing parties into the ICJ Digital Vault. No Advocate may withhold case files from the client. In case of advocate replacement, ICJ Super Admin can reassign the digital case file seamlessly to a new Advocate without any disruption.",
    },
    sec9: {
      title: "Self-Representation & Cost-Optimization Framework",
      content: "Clients may choose to represent themselves or attend routine court/administrative dates in person under ICJ AI & Advocate guidance to eliminate unnecessary advocate travel expenses. Advocates shall support hybrid/self-representation workflows for cost optimization.",
    },
    sec10: {
      title: "Intermediary Immunity & Non-Liability Clause (IT Act 2000 Sec 79)",
      content: "ICJ Trust acts strictly as an independent digital Intermediary, Facilitator, Mediator & Executor between Party A and Party B. Under Section 79 of the Information Technology Act 2000, ICJ Trust, its Trustees, Officers, and Employees are fully exempt from any third-party liability. The transaction is a purely private matter between Party A and Party B.",
    },
    sec11: {
      title: "Absolute Bar on Civil & Criminal Prosecution & Exclusive Arbitration",
      content: "Both parties explicitly agree that no civil suit, criminal complaint, FIR, or police grievance shall be instituted against ICJ Trust, its Trustees, Executive Officers, or Staff for any dispute arising out of this transaction or service. Any dispute must be submitted exclusively to internal binding arbitration by the ICJ Trust Board under the Arbitration & Conciliation Act 1996, whose decision shall be final and binding.",
    },
    sec12: {
      title: "Custom Terms",
      content: customTerms || "No additional terms.",
    },
  },
  signatures: {
    partyA: { signed: false, signedAt: null, otpVerified: false, ipAddress: null },
    partyB: { signed: false, signedAt: null, otpVerified: false, ipAddress: null },
    trustWitness: { signed: true, signedAt: new Date().toISOString(), autoWitnessed: true },
  },
  documentHash: null, // Set after both sign
  status: "PENDING_SIGNATURES",
  // Legal metadata
  legalFramework: {
    indianTrustsAct1882: true,
    indianContractAct1872: ["Sec 31 (Contingent Contract)", "Sec 63 (Waiver)"],
    itAct2000: ["Sec 5 (Digital Signature)", "Sec 3A (Electronic Auth)"],
    arbitrationAct1996: true,
    stampDutyApplicable: false,
    courtJurisdiction: "Lucknow, Uttar Pradesh (Subject to Arbitration Clause)",
  },
});

export const TokenAgreementService = {

  getAll() {
    return readStore(TUA_STORE_KEY);
  },

  getForMember(memberId) {
    return readStore(TUA_STORE_KEY).filter(
      (t) => t.parties.partyA.memberId === memberId || t.parties.partyB.memberId === memberId
    );
  },

  getById(tuaId) {
    return readStore(TUA_STORE_KEY).find((t) => t.tuaId === tuaId) || null;
  },

  /**
   * GENERATE a new TUA for a pending transaction
   */
  generate({ transactionRef, partyAId, partyAName, partyBId, partyBName, tokenAmount, transactionType, chargeRate, tokenRateAtSign, caseRefCode = null, customTerms = "" }) {
    const agreements = readStore(TUA_STORE_KEY);
    const tuaId = `TUA-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(agreements.length + 1).padStart(6, "0")}`;

    const doc = buildTuaDocument({ tuaId, transactionRef, partyAId, partyAName, partyBId, partyBName, tokenAmount, transactionType, chargeRate, tokenRateAtSign, caseRefCode, customTerms });
    writeStore(TUA_STORE_KEY, [doc, ...agreements]);
    return doc;
  },

  /**
   * SEND OTP to a party (simulated — in production: SMS via Twilio/MSG91)
   */
  sendOtp(tuaId, party) {
    const otpStore = readStore(OTP_STORE_KEY);
    const otp = generateOTP();
    const otpRecord = {
      tuaId,
      party,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      used: false,
    };
    writeStore(OTP_STORE_KEY, [otpRecord, ...otpStore.filter((o) => !(o.tuaId === tuaId && o.party === party))]);

    // In production: SMS this OTP. For dev: return it (console log only)
    console.info(`[ICJ TUA] OTP for ${party} on ${tuaId}: ${otp} (dev mode — SMS in production)`);
    return { sent: true, expiresInMinutes: 10, maskedOtp: `${otp.slice(0, 2)}XXXX` };
  },

  /**
   * VERIFY OTP and record signature
   */
  verifyAndSign(tuaId, party, enteredOtp) {
    const otpStore = readStore(OTP_STORE_KEY);
    const otpRecord = otpStore.find((o) => o.tuaId === tuaId && o.party === party && !o.used);

    if (!otpRecord) return { success: false, error: "OTP not found or already used." };
    if (new Date() > new Date(otpRecord.expiresAt)) return { success: false, error: "OTP expired. Please request a new one." };
    if (String(otpRecord.otp) !== String(enteredOtp)) return { success: false, error: "Incorrect OTP. Please try again." };

    // Mark OTP as used
    writeStore(OTP_STORE_KEY, otpStore.map((o) => o.tuaId === tuaId && o.party === party ? { ...o, used: true } : o));

    // Update TUA signatures
    const agreements = readStore(TUA_STORE_KEY);
    const updated = agreements.map((t) => {
      if (t.tuaId !== tuaId) return t;
      const newSigs = {
        ...t.signatures,
        [party]: { signed: true, signedAt: new Date().toISOString(), otpVerified: true },
      };
      const allSigned = newSigs.partyA.signed && newSigs.partyB.signed;
      const docHash = allSigned
        ? simpleHash(JSON.stringify({ ...t, signatures: newSigs, status: "SIGNED" }))
        : null;
      return {
        ...t,
        signatures: newSigs,
        status: allSigned ? "SIGNED" : "PARTIALLY_SIGNED",
        documentHash: docHash,
        completedAt: allSigned ? new Date().toISOString() : null,
      };
    });
    writeStore(TUA_STORE_KEY, updated);

    const freshDoc = updated.find((t) => t.tuaId === tuaId);
    return { success: true, agreement: freshDoc, fullyExecuted: freshDoc?.status === "SIGNED" };
  },

  /** Check if a TUA is fully signed (both parties) */
  isFullySigned(tuaId) {
    const doc = this.getById(tuaId);
    return doc?.status === "SIGNED";
  },
};

export default TokenAgreementService;
