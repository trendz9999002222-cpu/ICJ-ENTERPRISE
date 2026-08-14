/**
 * GlobalLegalJurisdictionService — ICJ Enterprise Platform
 * Provides Multi-Jurisdiction Legal Schema Switching & Global Compliance:
 * 1. 🇮🇳 India: BNS / BNSS / CPC / Revenue Courts & Special Statutory Tribunals
 * 2. 🇺🇸 United States: US Federal & State Courts / Code of Federal Regulations (CFR)
 * 3. 🇬🇧 United Kingdom: High Court of Justice & Civil Procedure Rules (CPR)
 * 4. 🇪🇺 European Union: EU Civil Law & GDPR Anonymization Standards
 */

export const JURISDICTIONS = {
  INDIA: {
    id: "INDIA",
    flag: "🇮🇳",
    name: "India (BNS/BNSS/CPC Judiciary)",
    courts: ["District & Sessions Court", "High Court of Judicature", "Supreme Court of India", "SDM / Revenue Court", "CAT / NGT / RERA / Consumer"],
    currency: "₹ (INR)",
    privacyStandard: "DPDP Act 2023 / Section 63 BSA",
  },
  USA: {
    id: "USA",
    flag: "🇺🇸",
    name: "United States (US Federal & State Courts)",
    courts: ["US District Court", "US Court of Appeals (Circuit)", "Supreme Court of the United States (SCOTUS)", "State Superior Court"],
    currency: "$ (USD)",
    privacyStandard: "CCPA / US Federal Privacy Rule",
  },
  UK: {
    id: "UK",
    flag: "🇬🇧",
    name: "United Kingdom (UK Common Law & CPR)",
    courts: ["County Court", "High Court of Justice (Chancery/King's Bench)", "Court of Appeal", "Supreme Court of the UK"],
    currency: "£ (GBP)",
    privacyStandard: "UK GDPR / Data Protection Act 2018",
  },
  EU: {
    id: "EU",
    flag: "🇪🇺",
    name: "European Union (EU Civil Law & CJEU)",
    courts: ["Court of Justice of the European Union (CJEU)", "European Court of Human Rights (ECHR)", "Member State Regional Court"],
    currency: "€ (EUR)",
    privacyStandard: "EU GDPR Article 17 / ISO 27001",
  },
};

const JURISDICTION_KEY = "icj_global_active_jurisdiction";

export const GlobalLegalJurisdictionService = {
  getActiveJurisdiction() {
    try {
      const activeId = localStorage.getItem(JURISDICTION_KEY) || "INDIA";
      return JURISDICTIONS[activeId] || JURISDICTIONS.INDIA;
    } catch {
      return JURISDICTIONS.INDIA;
    }
  },

  setActiveJurisdiction(jurisdictionId) {
    if (JURISDICTIONS[jurisdictionId]) {
      localStorage.setItem(JURISDICTION_KEY, jurisdictionId);
      return JURISDICTIONS[jurisdictionId];
    }
    return JURISDICTIONS.INDIA;
  },

  /**
   * GDPR Data Anonymization Audit for Global Compliance
   */
  anonymizePersonalData(text = "") {
    if (!text) return "";
    return text
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[ANONYMIZED_EMAIL]")
      .replace(/\b\d{10}\b/g, "[ANONYMIZED_PHONE]")
      .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, "[ANONYMIZED_GOVT_ID]");
  },
};

export default GlobalLegalJurisdictionService;
