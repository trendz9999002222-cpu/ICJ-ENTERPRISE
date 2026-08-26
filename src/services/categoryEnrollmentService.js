/**
 * CategoryEnrollmentService — ICJ Enterprise Platform
 * 100% Stealth Mode Category Governance & Enrollment Switchboard
 *
 * Rules:
 * 1. Fixed 5-Character Symmetrical Category Codes for all 42+ legal, forensic, corporate & judicial personas.
 * 2. Absolute Stealth Mode: Unchecked/disabled categories are 100% invisible from public registration.
 *    ZERO "Coming Soon" hints to prevent any strategy leaks.
 * 3. Live Admin Switchboard: Toggle open/close status and view real-time headcount telemetry.
 */

const STORAGE_KEY = "icj_admin_category_switchboard_v1";

export const MASTER_CATEGORIES_REGISTRY = [
  // ─── 1. ADVOCATES & LEGAL PRACTITIONERS ───
  { code5: "ADVUP", name: "Advocate / Legal Counsel (Uttar Pradesh)", group: "Legal", defaultOpen: true, badgeTitle: "Enrolled Advocate • Bar Council of UP" },
  { code5: "ADVDL", name: "Advocate / Legal Counsel (Delhi)", group: "Legal", defaultOpen: true, badgeTitle: "Enrolled Advocate • Bar Council of Delhi" },
  { code5: "ADVMH", name: "Advocate / Legal Counsel (Maharashtra)", group: "Legal", defaultOpen: true, badgeTitle: "Enrolled Advocate • Bar Council of Maharashtra & Goa" },
  { code5: "ADVBR", name: "Advocate / Legal Counsel (Bihar)", group: "Legal", defaultOpen: true, badgeTitle: "Enrolled Advocate • Bihar State Bar Council" },
  { code5: "ADVRJ", name: "Advocate / Legal Counsel (Rajasthan)", group: "Legal", defaultOpen: true, badgeTitle: "Enrolled Advocate • Bar Council of Rajasthan" },
  { code5: "ADVMP", name: "Advocate / Legal Counsel (Madhya Pradesh)", group: "Legal", defaultOpen: true, badgeTitle: "Enrolled Advocate • MP State Bar Council" },
  { code5: "ADVWB", name: "Advocate / Legal Counsel (West Bengal)", group: "Legal", defaultOpen: true, badgeTitle: "Enrolled Advocate • Bar Council of West Bengal" },
  { code5: "ADVKR", name: "Advocate / Legal Counsel (Karnataka)", group: "Legal", defaultOpen: true, badgeTitle: "Enrolled Advocate • Karnataka State Bar Council" },
  { code5: "ADVTN", name: "Advocate / Legal Counsel (Tamil Nadu)", group: "Legal", defaultOpen: true, badgeTitle: "Enrolled Advocate • Bar Council of TN & Puducherry" },
  { code5: "ADVPB", name: "Advocate / Legal Counsel (Punjab & Haryana)", group: "Legal", defaultOpen: true, badgeTitle: "Enrolled Advocate • Bar Council of Punjab & Haryana" },
  { code5: "SRADV", name: "Senior Advocate (वरिष्ठ अधिवक्ता)", group: "Legal", defaultOpen: true, badgeTitle: "Designated Senior Counsel • Supreme Court / High Court" },
  { code5: "AORSC", name: "Advocate-on-Record (AOR - सुप्रीम कोर्ट)", group: "Legal", defaultOpen: true, badgeTitle: "Advocate-on-Record • Supreme Court of India" },
  { code5: "NPADV", name: "Non-Practicing Advocate (नॉन-प्रैक्टिसिंग वकील)", group: "Legal", defaultOpen: true, badgeTitle: "Non-Practicing Advocate • Corporate Legal Advisor" },
  { code5: "PUBPR", name: "Public Prosecutor (लोक अभियोजक / APP)", group: "Legal", defaultOpen: false, badgeTitle: "Public Prosecutor • State Prosecution Directorate" },
  { code5: "GOVPL", name: "Standing Counsel / Govt. Pleader", group: "Legal", defaultOpen: false, badgeTitle: "Standing Counsel • Union / State Government" },
  { code5: "LAIDC", name: "Legal Aid Counsel (विधिक सहायता वकील)", group: "Legal", defaultOpen: false, badgeTitle: "Empaneled Legal Aid Counsel • DLSA / SLSA" },
  { code5: "AMICU", name: "Amicus Curiae (न्याय मित्र)", group: "Legal", defaultOpen: false, badgeTitle: "Court-Appointed Amicus Curiae" },

  // ─── 2. COURT OFFICERS & NOTARIES ───
  { code5: "NOTRY", name: "Notary Public (नोटरी पब्लिक)", group: "CourtOfficers", defaultOpen: true, badgeTitle: "Govt. Appointed Notary Public" },
  { code5: "OATHC", name: "Oath Commissioner (शपथ आयुक्त)", group: "CourtOfficers", defaultOpen: true, badgeTitle: "High Court Appointed Oath Commissioner" },
  { code5: "COMMR", name: "Court Commissioner / Receiver (अदालती आयुक्त)", group: "CourtOfficers", defaultOpen: false, badgeTitle: "Court Appointed Local Commissioner" },
  { code5: "ARBIT", name: "Arbitrator (मध्यस्थ / पंच)", group: "CourtOfficers", defaultOpen: true, badgeTitle: "Certified Arbitrator • ADR Tribunal" },
  { code5: "MEDTR", name: "Mediator / Conciliator (सुलहकर्ता)", group: "CourtOfficers", defaultOpen: true, badgeTitle: "Court-Annexed Certified Mediator" },

  // ─── 3. FORENSIC & EXPERT WITNESSES ───
  { code5: "HNWRT", name: "Handwriting & Signature Expert (हस्तलेख विशेषज्ञ)", group: "Forensics", defaultOpen: true, badgeTitle: "Forensic Questioned Document Examiner (QDE)" },
  { code5: "FINGR", name: "Fingerprint Expert (फिंगरप्रिंट विशेषज्ञ)", group: "Forensics", defaultOpen: true, badgeTitle: "Certified Forensic Fingerprint Expert" },
  { code5: "CYBER", name: "Cyber & Digital Forensics Expert", group: "Forensics", defaultOpen: true, badgeTitle: "Digital Evidence & 65B/63 BSA Certifier" },
  { code5: "MEDCL", name: "Medico-Legal Expert (मेडिको-लीगल डॉक्टर)", group: "Forensics", defaultOpen: false, badgeTitle: "Medico-Legal & Forensic Medical Specialist" },
  { code5: "BALST", name: "Ballistics & Weapon Expert (बैलिस्टिक विशेषज्ञ)", group: "Forensics", defaultOpen: false, badgeTitle: "Forensic Ballistics & Firearms Expert" },
  { code5: "AUDIO", name: "Audio/Video Authentication Expert", group: "Forensics", defaultOpen: false, badgeTitle: "Forensic Audio/Video Spectrography Analyst" },
  { code5: "DNAEX", name: "DNA Profiling Expert (डीएनए विशेषज्ञ)", group: "Forensics", defaultOpen: false, badgeTitle: "Forensic DNA Profiling & Serology Specialist" },
  { code5: "POLYP", name: "Polygraph / Lie-Detector Expert", group: "Forensics", defaultOpen: false, badgeTitle: "Polygraph & Lie Detection Analyst" },

  // ─── 4. CORPORATE & FINANCIAL EXPERTS ───
  { code5: "CHACT", name: "Chartered Accountant (CA)", group: "Corporate", defaultOpen: true, badgeTitle: "Chartered Accountant • ICAI Registered" },
  { code5: "COSEC", name: "Company Secretary (CS)", group: "Corporate", defaultOpen: true, badgeTitle: "Company Secretary • ICSI Registered" },
  { code5: "COACC", name: "Cost & Management Accountant (CMA)", group: "Corporate", defaultOpen: true, badgeTitle: "Cost & Management Accountant • ICMAI" },
  { code5: "INSLV", name: "Insolvency Professional (IP / RP)", group: "Corporate", defaultOpen: true, badgeTitle: "Insolvency Resolution Professional • IBBI" },
  { code5: "RGVAL", name: "Registered Valuer (शासकीय मूल्यांकक)", group: "Corporate", defaultOpen: true, badgeTitle: "Govt. Approved Registered Valuer • IBBI" },
  { code5: "FRAUD", name: "Forensic Auditor / Fraud Examiner (CFE)", group: "Corporate", defaultOpen: false, badgeTitle: "Certified Fraud Examiner & Forensic Auditor" },
  { code5: "SURVY", name: "Insurance Surveyor & Loss Assessor", group: "Corporate", defaultOpen: false, badgeTitle: "Licensed Insurance Loss Assessor • IRDAI" },

  // ─── 5. REVENUE & LAND SURVEY ───
  { code5: "LAMIN", name: "Land Surveyor / Amin (प्रमाणित अमीन)", group: "Revenue", defaultOpen: true, badgeTitle: "Certified Land Surveyor & Amin" },
  { code5: "ARCHT", name: "Architect & Town Planner (आर्किटेक्ट)", group: "Revenue", defaultOpen: true, badgeTitle: "Chartered Architect & RERA Town Planner" },

  // ─── 6. RETIRED OFFICERS (Rt-SERIES) ───
  { code5: "RtJUD", name: "Retired Judge / Judicial Officer (सेवानिवृत्त न्यायाधीश)", group: "Retired", defaultOpen: true, badgeTitle: "Hon'ble Retired Judicial Officer" },
  { code5: "RtPOL", name: "Retired Police Officer (IPS/PPS/Inspector)", group: "Retired", defaultOpen: true, badgeTitle: "Retired Police Investigation Specialist" },
  { code5: "RtREV", name: "Retired Tehsildar / Kanungo (राजस्व अधिकारी)", group: "Retired", defaultOpen: true, badgeTitle: "Retired Revenue Officer & Tehsildar" },
  { code5: "RtJAG", name: "Retired Defense / JAG Officer (सेना विधिक अधिकारी)", group: "Retired", defaultOpen: false, badgeTitle: "Retired Judge Advocate General (JAG)" },
  { code5: "RtTAX", name: "Retired Tax / Customs Enforcement Officer", group: "Retired", defaultOpen: false, badgeTitle: "Retired Tax & Customs Officer" },

  // ─── 7. COURT CLERKS & SUPPORT ───
  { code5: "MNSHI", name: "Advocate Clerk / Court Munshi (पंजीकृत मुंशी)", group: "Support", defaultOpen: true, badgeTitle: "Registered Court Munshi & Advocate Clerk" },
  { code5: "TYPST", name: "Certified Court Typist / Legal Steno", group: "Support", defaultOpen: false, badgeTitle: "Certified Legal Typist & Transcriptionist" },
  { code5: "TRANS", name: "Legal Translator / Interpreter (विधिक अनुवादक)", group: "Support", defaultOpen: false, badgeTitle: "Certified Court Translator & Interpreter" },

  // ─── 8. CITIZENS & GOVERNANCE ───
  { code5: "CLINT", name: "Litigant / Citizen (मुवक्किल / आम नागरिक)", group: "Citizens", defaultOpen: true, badgeTitle: "Registered Litigant / Citizen" },
  { code5: "FRANR", name: "Franchise Regional Node (जिला केंद्र)", group: "Governance", defaultOpen: false, badgeTitle: "Authorized District Legal Aid Center" },
  { code5: "SADMN", name: "Super Admin (सिस्टम व्यवस्थापक)", group: "Governance", defaultOpen: false, badgeTitle: "Supreme System Governance" },
  { code5: "OADMN", name: "Operations Admin (संचालन डेस्क)", group: "Governance", defaultOpen: false, badgeTitle: "Platform Operations & Scrutiny Desk" },
];

export const CategoryEnrollmentService = {
  /**
   * Get all categories with their current admin switch state (Open / Closed)
   */
  getAllCategoriesWithState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const savedStates = raw ? JSON.parse(raw) : {};

      return MASTER_CATEGORIES_REGISTRY.map((cat) => ({
        ...cat,
        isOpen: savedStates[cat.code5] !== undefined ? savedStates[cat.code5] : cat.defaultOpen,
      }));
    } catch {
      return MASTER_CATEGORIES_REGISTRY.map((cat) => ({ ...cat, isOpen: cat.defaultOpen }));
    }
  },

  /**
   * Toggle a category's enrollment status (Super Admin Only)
   */
  toggleCategoryStatus(code5, isOpen) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const states = raw ? JSON.parse(raw) : {};
      states[code5] = Boolean(isOpen);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
      return true;
    } catch (e) {
      console.error("Failed to save category state", e);
      return false;
    }
  },

  /**
   * 100% STEALTH PUBLIC FETCHER:
   * Returns ONLY currently OPEN/enabled categories.
   * Disabled categories are completely filtered out (NO 'Coming Soon' hints).
   */
  getPublicActiveCategories() {
    const all = this.getAllCategoriesWithState();
    return all.filter((cat) => cat.isOpen && cat.code5 !== "SADMN" && cat.code5 !== "OADMN" && cat.code5 !== "FRANR");
  },

  /**
   * Get Category details by 5-character code
   */
  getCategoryByCode(code5 = "CLINT") {
    const found = MASTER_CATEGORIES_REGISTRY.find((c) => c.code5 === code5);
    return (
      found || {
        code5: "CLINT",
        name: "Litigant / Citizen",
        badgeTitle: "Registered Citizen",
        group: "Citizens",
      }
    );
  },
};

export default CategoryEnrollmentService;
