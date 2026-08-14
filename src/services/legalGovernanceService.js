/**
 * LegalGovernanceService — ICJ Enterprise Platform
 * Platform Legal Governance, IT Act 2000 Section 79 Intermediary Protection,
 * DPDP Act 2023 Consent, and 70:20:10 Advocate Commercial Agreement Engine.
 */

const CONSENT_LOGS_KEY = "icj_legal_consent_logs_master";

const getStore = (key, defaultVal = []) => {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultVal;
    }
    return defaultVal;
  } catch {
    return defaultVal;
  }
};

const setStore = (key, val) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (e) {
    console.error("LegalGovernanceService setStore error", e);
  }
};

export const LegalGovernanceService = {
  /**
   * 👥 1. Public Litigant / General Registration Terms & Disclaimers
   */
  getPublicLitigantTerms() {
    return {
      title: "ICJ Enterprise Platform — General Terms of Service & Legal Disclaimers",
      clauses: [
        {
          id: "IT_ACT_SEC_79",
          title: "1. IT Act 2000 Section 79 Intermediary Safe Harbor Protection",
          text: "ICJ Enterprise Platform operates strictly as a Neutral Technology Intermediary under Section 79 of the Information Technology Act, 2000 (as amended). The platform provides neutral technology infrastructure connecting litigants with independent empanelled advocates and district branches. The platform does not directly render legal advice, nor does it control, alter, or endorse user-submitted legal pleadings, case communications, or advocate advice.",
        },
        {
          id: "DATA_ENCRYPTION_SEC_43A",
          title: "2. IT Act Section 43A / 72A Data Encryption & Criminal Anti-Theft Protection",
          text: "All case records, audio/video stream metadata, and document vaults are protected using 256-bit AES cryptographic encryption standards under IT Act Section 43A. Unauthorized extraction, web scraping, or misuse of member data is strictly prohibited and subject to criminal prosecution under IT Act Sections 66, 66B, 66C, and 66D.",
        },
        {
          id: "DPDP_ACT_2023",
          title: "3. Digital Personal Data Protection (DPDP) Act 2023 Consent",
          text: "Users explicitly authorize the collection, processing, and storage of personal data, district location, and litigation intake records solely for matching with local district franchisees, branches, and empanelled advocates under DPDP Act 2023 guidelines.",
        },
        {
          id: "PUSH_ALERT_AUTHORIZATION",
          title: "4. Background Web Push API & Emergency Siren Authorization",
          text: "Users explicitly grant irrevocable authorization for background Web Push alerts, VAPID OS-level dispatch signals, continuous emergency audio sirens, and automated SMS/WhatsApp alerts for urgent litigation matters, emergency court hearings, and panic SOS requests.",
        },
        {
          id: "AI_DECISION_SUPPORT",
          title: "5. AI Legal Drafter & Decision Support Disclaimer",
          text: "AI Legal Drafter & Intelligence tools are decision-support aids; formal legal representation is exclusively provided by empanelled independent advocates.",
        },
      ],
    };
  },

  /**
   * ⚖️ 2. Advocate & Franchisee Commercial Agreement (Presented ONLY on Business Acceptance)
   */
  getAdvocateCommercialTerms() {
    return {
      title: "Empaneled Advocate & Franchisee Commercial Settlement Agreement",
      clauses: [
        {
          id: "COMMERCIAL_SPLIT_70_20_10",
          title: "1. 70:20:10 Commercial Revenue Distribution Structure",
          text: "Advocates and Franchisees explicitly accept the platform's transparent 70:20:10 revenue settlement structure: 70% Advocate Payout Pool | 20% ICJ Trust Operational Fund | 10% Local District Franchisee / Branch Commission.",
        },
        {
          id: "TDS_SEC_194J",
          title: "2. TDS Section 194J Tax Deduction Compliance",
          text: "All professional fee payouts to advocates are subject to 10% Tax Deducted at Source (TDS) under Section 194J of the Income Tax Act 1961.",
        },
        {
          id: "FRANCHISEE_TERRITORY_TERMS",
          title: "3. District Franchisee Territory & Case Routing Terms",
          text: "Franchisees agree to manage district branch logistics and route unassigned litigant intakes to empanelled lawyers within their assigned district territory.",
        },
      ],
    };
  },

  /**
   * Log User Digital Consent Timestamp & IP Record
   */
  logConsent({ userId, userName, role = "litigant", consentType = "PUBLIC_TERMS", ipAddress = "127.0.0.1" }) {
    const logs = getStore(CONSENT_LOGS_KEY, []);
    const entry = {
      id: `CONSENT-${Date.now()}`,
      userId: userId || "GUEST",
      userName: userName || "Litigant",
      role,
      consentType,
      ipAddress,
      timestamp: new Date().toISOString(),
      status: "AGREED_AND_LOGGED",
    };
    logs.unshift(entry);
    setStore(CONSENT_LOGS_KEY, logs);
    return entry;
  },

  /**
   * Get Consent Audit Logs
   */
  getConsentLogs() {
    return getStore(CONSENT_LOGS_KEY, []);
  },
};

export default LegalGovernanceService;
