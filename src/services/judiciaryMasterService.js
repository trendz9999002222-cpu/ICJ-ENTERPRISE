/**
 * JudiciaryMasterService — ICJ Enterprise Platform (v3.0)
 * 
 * Master Repository for:
 * 1. 10-Forum Classification & 12 Practice Core Specialties
 * 2. 25 Official High Courts (Principal Seats, Benches & Registries)
 * 3. High Court-Specific Case Type Taxonomies (WP(C), CRL.A, ARB.P, CS(COMM), etc.)
 * 4. District Court Establishment-Specific Case Types (Sessions, Family, Commercial, POCSO, CJM)
 * 5. 16-Character eCourts CNR (Case Number Record) Validation Engine
 */

export const JUDICIAL_FORUMS = [
  { rank: 1, id: "SUPREME_COURT", name: "Supreme Court of India (SLPs & Constitutional Bench)", badgeColor: "#7c3aed" },
  { rank: 2, id: "HIGH_COURT", name: "High Courts of Judicature (Writs, Appeals & Revisions)", badgeColor: "#1d4ed8" },
  { rank: 3, id: "DISTRICT_COURT", name: "District & Subordinate Courts (Civil, Criminal & Sessions)", badgeColor: "#059669" },
  { rank: 4, id: "TEHSIL_SDM", name: "Tehsil & SDM Courts (Revenue Mutation & Sec 144 Suits)", badgeColor: "#d97706" },
  { rank: 5, id: "NCLT_NCLAT", name: "NCLT / NCLAT (Corporate Insolvency IBC & Mergers)", badgeColor: "#2563eb" },
  { rank: 6, id: "NGT", name: "NGT (National Green Tribunal - Environmental Laws)", badgeColor: "#047857" },
  { rank: 7, id: "DRT_DRAT", name: "DRT / DRAT (Debts Recovery & SARFAESI Banking)", badgeColor: "#b91c1c" },
  { rank: 8, id: "RERA_CONSUMER", name: "RERA Real Estate & Consumer Protection Commission", badgeColor: "#c026d3" },
  { rank: 9, id: "CAT", name: "CAT (Central Administrative Tribunal - Service & Pension)", badgeColor: "#4f46e5" },
  { rank: 10, id: "LABOUR_COURT", name: "Labour Court & Industrial Disputes Tribunal", badgeColor: "#475569" },
];

export const CORE_SPECIALTIES = [
  { id: "CRIMINAL_BAIL", name: "Criminal Law & Midnight Bail / FIR Quashing (Sec 482 CrPC / 528 BNSS)", rankIcon: "🥇" },
  { id: "CIVIL_INJUNCTIONS", name: "Civil Litigation, Injunctions & Property Title Suits (Order 39 CPC)", rankIcon: "🥈" },
  { id: "CONSTITUTIONAL_WRITS", name: "Constitutional & Administrative High Court Writs (Art 226/32)", rankIcon: "🥉" },
  { id: "NCLT_CORPORATE", name: "NCLT Corporate Insolvency, Bankruptcy & Mergers (IBC 2016)", rankIcon: "🏢" },
  { id: "TAX_REVENUE", name: "Income Tax, GST, Customs & Financial Revenue Litigation", rankIcon: "💰" },
  { id: "TEHSIL_KHASRA", name: "Revenue, Tehsil Mutation, Khasra Suits & SDM Executive Court", rankIcon: "📜" },
  { id: "MATRIMONIAL_DV", name: "Matrimonial, Divorce, Maintenance (125 CrPC) & Domestic Violence", rankIcon: "🛡️" },
  { id: "CONSUMER_RERA", name: "Consumer Protection, Medical Negligence & RERA Real Estate", rankIcon: "🏥" },
  { id: "SARFAESI_DRT", name: "SARFAESI, DRT Banking Recovery & Cheque Bounce (Sec 138 NI Act)", rankIcon: "⚖️" },
  { id: "NGT_ENVIRONMENT", name: "NGT Environmental, Pollution & Forest Regulatory Laws", rankIcon: "🌲" },
  { id: "CAT_SERVICE", name: "CAT Service Matters, Government Employee Pension & Appointments", rankIcon: "🏛️" },
  { id: "ARBITRATION", name: "International & Domestic Commercial Arbitration & Conciliation", rankIcon: "🤝" },
];

// 25 Official High Courts of India
export const OFFICIAL_HIGH_COURTS = [
  { code: "HC-DEL", stateCode: "ST-07", name: "High Court of Delhi", principalSeat: "New Delhi", benches: ["Principal Seat at New Delhi"], cnrPrefix: "DLHC" },
  { code: "HC-ALL", stateCode: "ST-09", name: "Allahabad High Court", principalSeat: "Prayagraj (Allahabad)", benches: ["Prayagraj Principal Seat", "Lucknow Bench"], cnrPrefix: "UPHC" },
  { code: "HC-BOM", stateCode: "ST-27", name: "Bombay High Court", principalSeat: "Mumbai", benches: ["Mumbai Principal Seat", "Nagpur Bench", "Aurangabad Bench", "Panaji (Goa) Bench"], cnrPrefix: "MAHC" },
  { code: "HC-MAD", stateCode: "ST-33", name: "Madras High Court", principalSeat: "Chennai", benches: ["Chennai Principal Seat", "Madurai Bench"], cnrPrefix: "TNHC" },
  { code: "HC-CAL", stateCode: "ST-19", name: "Calcutta High Court", principalSeat: "Kolkata", benches: ["Kolkata Principal Seat", "Jalpaiguri Circuit Bench", "Port Blair Circuit Bench"], cnrPrefix: "WBHC" },
  { code: "HC-KAR", stateCode: "ST-29", name: "High Court of Karnataka", principalSeat: "Bengaluru", benches: ["Bengaluru Principal Seat", "Dharwad Bench", "Kalaburagi (Gulbarga) Bench"], cnrPrefix: "KAHC" },
  { code: "HC-GUJ", stateCode: "ST-24", name: "High Court of Gujarat", principalSeat: "Ahmedabad", benches: ["Principal Seat at Ahmedabad"], cnrPrefix: "GJHC" },
  { code: "HC-PAT", stateCode: "ST-10", name: "Patna High Court", principalSeat: "Patna", benches: ["Principal Seat at Patna"], cnrPrefix: "BRHC" },
  { code: "HC-RAJ", stateCode: "ST-08", name: "Rajasthan High Court", principalSeat: "Jodhpur", benches: ["Jodhpur Principal Seat", "Jaipur Bench"], cnrPrefix: "RJHC" },
  { code: "HC-MP", stateCode: "ST-23", name: "Madhya Pradesh High Court", principalSeat: "Jabalpur", benches: ["Jabalpur Principal Seat", "Indore Bench", "Gwalior Bench"], cnrPrefix: "MPHC" },
  { code: "HC-PNH", stateCode: "ST-03", name: "Punjab and Haryana High Court", principalSeat: "Chandigarh", benches: ["Principal Seat at Chandigarh"], cnrPrefix: "PNHC" },
  { code: "HC-TEL", stateCode: "ST-36", name: "High Court for Telangana", principalSeat: "Hyderabad", benches: ["Principal Seat at Hyderabad"], cnrPrefix: "TSHC" },
  { code: "HC-AP", stateCode: "ST-28", name: "High Court of Andhra Pradesh", principalSeat: "Amaravati", benches: ["Principal Seat at Amaravati"], cnrPrefix: "APHC" },
  { code: "HC-KER", stateCode: "ST-32", name: "High Court of Kerala", principalSeat: "Ernakulam (Kochi)", benches: ["Principal Seat at Ernakulam"], cnrPrefix: "KLHC" },
  { code: "HC-ORI", stateCode: "ST-21", name: "Orissa High Court", principalSeat: "Cuttack", benches: ["Principal Seat at Cuttack"], cnrPrefix: "ODHC" },
  { code: "HC-GAU", stateCode: "ST-18", name: "Gauhati High Court", principalSeat: "Guwahati", benches: ["Guwahati Principal Seat", "Kohima Bench", "Aizawl Bench", "Itanagar Bench"], cnrPrefix: "ASNC" },
  { code: "HC-CHH", stateCode: "ST-22", name: "High Court of Chhattisgarh", principalSeat: "Bilaspur", benches: ["Principal Seat at Bilaspur"], cnrPrefix: "CGHC" },
  { code: "HC-JHR", stateCode: "ST-20", name: "High Court of Jharkhand", principalSeat: "Ranchi", benches: ["Principal Seat at Ranchi"], cnrPrefix: "JHHC" },
  { code: "HC-HP", stateCode: "ST-02", name: "High Court of Himachal Pradesh", principalSeat: "Shimla", benches: ["Principal Seat at Shimla"], cnrPrefix: "HPHC" },
  { code: "HC-UTT", stateCode: "ST-05", name: "High Court of Uttarakhand", principalSeat: "Nainital", benches: ["Principal Seat at Nainital"], cnrPrefix: "UKHC" },
  { code: "HC-JKL", stateCode: "ST-01", name: "High Court of Jammu & Kashmir and Ladakh", principalSeat: "Srinagar / Jammu", benches: ["Srinagar Wing", "Jammu Wing"], cnrPrefix: "JKHC" },
  { code: "HC-MEG", stateCode: "ST-17", name: "High Court of Meghalaya", principalSeat: "Shillong", benches: ["Principal Seat at Shillong"], cnrPrefix: "MLHC" },
  { code: "HC-MAN", stateCode: "ST-14", name: "High Court of Manipur", principalSeat: "Imphal", benches: ["Principal Seat at Imphal"], cnrPrefix: "MNHC" },
  { code: "HC-TRI", stateCode: "ST-16", name: "High Court of Tripura", principalSeat: "Agartala", benches: ["Principal Seat at Agartala"], cnrPrefix: "TRHC" },
  { code: "HC-SIK", stateCode: "ST-11", name: "High Court of Sikkim", principalSeat: "Gangtok", benches: ["Principal Seat at Gangtok"], cnrPrefix: "SKHC" },
];

// Official High Court Case Type Taxonomy Catalogs
export const HIGH_COURT_CASE_TYPES = [
  { id: "WP_CIVIL", code: "W.P.(C)", name: "Writ Petition (Civil) — Art. 226/227", category: "Constitutional & Administrative", subCategories: ["Service & Employment", "Land Acquisition", "Municipal & Local Body", "Tender & Public Contract", "Education & University"] },
  { id: "WP_CRIMINAL", code: "W.P.(CRL)", name: "Writ Petition (Criminal) — Art. 226", category: "Criminal Pleading & Liberty", subCategories: ["Habeas Corpus", "Police Protection", "Investigation Transfer (CBI/CID)", "Custodial Torture"] },
  { id: "WP_PIL", code: "W.P.(PIL)", name: "Public Interest Litigation (PIL)", category: "Constitutional & Public Law", subCategories: ["Environmental & Forest", "Citizen Governance", "Public Health & Safety", "Judicial Reforms"] },
  { id: "CRL_MC", code: "CRL.M.C.", name: "Criminal Miscellaneous Main (Sec 482 CrPC / 528 BNSS)", category: "Criminal Quashing & Review", subCategories: ["FIR Quashing", "Charge Sheet Quashing", "Summoning Order Challenge", "Compounding Settlement"] },
  { id: "BAIL_APPLN", code: "BAIL APPLN.", name: "Bail Application (Sec 438/439 CrPC / 482/483 BNSS)", category: "Bail & Personal Liberty", subCategories: ["Anticipatory Bail (Sec 438)", "Regular Bail (Sec 439)", "Interim Medical Bail", "Bail Cancellation"] },
  { id: "CRL_A", code: "CRL.A.", name: "Criminal Appeal", category: "Criminal Appeals", subCategories: ["Appeal against Conviction", "Appeal against Acquittal", "Sentence Enhancement", "PMLA / NDPS Special Appeal"] },
  { id: "CS_COMM", code: "CS(COMM)", name: "Commercial Civil Suit (Commercial Courts Act 2015)", category: "Commercial Litigation", subCategories: ["IPR & Trademark Infringement", "Breach of Commercial Contract", "Shareholder & JV Dispute", "Supply Chain Recovery"] },
  { id: "ARB_P", code: "ARB.P.", name: "Arbitration Petition (Sec 11/34 Arbitration Act)", category: "Arbitration & Dispute Resolution", subCategories: ["Appointment of Arbitrator (Sec 11)", "Challenge to Arbitral Award (Sec 34)", "Interim Measures (Sec 9)", "Foreign Award Enforcement (Sec 48)"] },
  { id: "MAT_APP", code: "MAT.APP.(F.C.)", name: "Matrimonial Appeal (Family Court Appeal)", category: "Family & Matrimonial", subCategories: ["Divorce Decree Challenge", "Child Custody Order Appeal", "Permanent Alimony & Maintenance"] },
  { id: "RFA", code: "RFA", name: "Regular First Appeal (Sec 96 CPC)", category: "Civil Appeals", subCategories: ["Property Title Appeal", "Partition Suit Appeal", "Money Decree Appeal", "Specific Performance Appeal"] },
  { id: "CONT_CAS", code: "CONT.CAS(C)", name: "Contempt Case (Civil) — Contempt of Courts Act", category: "Contempt & Compliance", subCategories: ["High Court Order Non-Compliance", "Tribunal Order Non-Compliance", "Breach of Undertaking"] },
  { id: "ITA", code: "ITA", name: "Income Tax Appeal (Sec 260A IT Act)", category: "Taxation & Revenue", subCategories: ["Substantial Question of Law", "Transfer Pricing", "Search & Seizure Assessment", "GST High Court Reference"] },
];

// District Court Establishment-Specific Case Types
export const DISTRICT_ESTABLISHMENT_CASE_TYPES = {
  DISTRICT_SESSIONS: [
    { id: "SESSIONS_CASE", code: "SC", name: "Sessions Case (Murder, Heinous Crime Trial)", category: "Criminal Trial", subCategories: ["Sessions Trial (IPC/BNS)", "NDPS Special Sessions", "CBI / ACB Special Trial"] },
    { id: "CRIMINAL_APPEAL", code: "CA", name: "Criminal Appeal (against Magistrate Judgment)", category: "Criminal Appeals", subCategories: ["Appeal against Conviction", "DV Act Appeal (Sec 29)", "Juvenile Justice Appeal"] },
    { id: "CRIMINAL_REVISION", code: "CR", name: "Criminal Revision (Sec 397/401 CrPC)", category: "Criminal Revision", subCategories: ["Revision against Summoning Order", "Revision against Discharge Rejection", "Interim Custody Revision"] },
    { id: "SESSIONS_BAIL", code: "BAIL", name: "Sessions Bail Application (Sec 439 / 438 CrPC)", category: "Bail & Liberty", subCategories: ["Regular Bail", "Anticipatory Bail", "Interim Bail", "Surrender Application"] },
    { id: "CIVIL_SUIT", code: "CS", name: "Original Civil Suit (Title, Injunction, Partition)", category: "Civil Original", subCategories: ["Permanent Injunction (Order 39)", "Declaration of Title", "Partition & Separate Possession", "Recovery of Money Suit"] },
    { id: "CIVIL_APPEAL", code: "RCA", name: "Regular Civil Appeal (against Civil Judge Decree)", category: "Civil Appeals", subCategories: ["Decree Appeal", "Order 43 Misc Appeal", "Eviction Appeal"] },
    { id: "MOTOR_ACCIDENT", code: "MACP", name: "Motor Accident Claim Petition (MACT)", category: "Accident Compensation", subCategories: ["Fatal Road Accident Claim", "Permanent Disability Compensation", "Third Party Insurance Claim"] },
  ],
  FAMILY_COURT: [
    { id: "HMA_DIVORCE", code: "HMA", name: "Hindu Marriage Act Petition (Sec 13 / 13B)", category: "Matrimonial Dissolution", subCategories: ["Mutual Consent Divorce (13B)", "Contested Divorce (Cruelty/Desertion)", "Restitution of Conjugal Rights (Sec 9)", "Annulment of Marriage (Sec 11/12)"] },
    { id: "FAMILY_MAINTENANCE", code: "MT", name: "Maintenance Petition (Sec 125 CrPC / 144 BNSS)", category: "Family Maintenance", subCategories: ["Wife Maintenance Claim", "Minor Child Maintenance", "Senior Citizen Parent Maintenance", "Interim Monthly Maintenance"] },
    { id: "CHILD_CUSTODY", code: "GW", name: "Guardians & Wards Petition (Child Custody & Visitation)", category: "Child Welfare", subCategories: ["Permanent Custody", "Visitation Rights", "Passport / Relocation Permission", "Interim Weekend Access"] },
    { id: "DOMESTIC_VIOLENCE", code: "DV", name: "Domestic Violence Act Petition (PWDVA 2005)", category: "Women Protection", subCategories: ["Protection Order (Sec 18)", "Residence Order (Sec 19)", "Monetary Relief (Sec 20)", "Compensation Order (Sec 22)"] },
  ],
  COMMERCIAL_COURT: [
    { id: "COMM_SUIT", code: "CS(COMM)", name: "Commercial Civil Suit (Specified Value > 3 Lakhs)", category: "Commercial Pleading", subCategories: ["Commercial Contract Breach", "Intellectual Property / Trademark", "Share Purchase & Joint Venture", "Real Estate Commercial Lease"] },
    { id: "COMM_SUMMARY", code: "OMP(COMM)", name: "Commercial Arbitration Application / Execution", category: "Commercial Arbitration", subCategories: ["Sec 9 Interim Relief", "Sec 34 Award Challenge", "Commercial Execution Petition (Order 21)"] },
  ],
  POCSO_SPECIAL: [
    { id: "POCSO_CASE", code: "POCSO", name: "Special POCSO Act Trial (Child Protection)", category: "Special POCSO Trial", subCategories: ["Aggravated Sexual Assault Trial", "Child Abuse Prosecution", "Special Court Bail Application"] },
    { id: "SC_ST_CASE", code: "SC/ST", name: "Special SC/ST (Prevention of Atrocities) Trial", category: "Special Caste Protection", subCategories: ["Atrocities Act Prosecution", "Statutory Appeal under Sec 14A", "Victim Compensation"] },
  ],
  CJM_MAGISTRATE: [
    { id: "CRIMINAL_COMPLAINT", code: "CC", name: "Criminal Complaint Case (Sec 200 CrPC / 223 BNSS)", category: "Magisterial Complaint", subCategories: ["Private Criminal Complaint", "Cheque Bounce (Sec 138 NI Act)", "Defamation Complaint", "Fraud & Cheating (Sec 420 IPC)"] },
    { id: "STATE_CHALLAN", code: "CR", name: "State Police Challan / Charge Sheet Trial", category: "Police Prosecution", subCategories: ["Magisterial Trial (Warrant Case)", "Summary Trial (Traffic/Minor Offences)", "Remand & Police Custody Hearing"] },
    { id: "MAGISTRATE_BAIL", code: "BAIL", name: "Magistrate Bail Application (Sec 437 CrPC)", category: "Magisterial Bail", subCategories: ["Bailable Offence Bail", "Non-Bailable Offence Interim Bail", "Default Bail (Sec 167(2) CrPC)"] },
  ],
};

export const JudiciaryMasterService = {
  getForums() {
    return JUDICIAL_FORUMS;
  },

  getSpecialties() {
    return CORE_SPECIALTIES;
  },

  getHighCourts() {
    return OFFICIAL_HIGH_COURTS;
  },

  getHighCourtByCode(code) {
    return OFFICIAL_HIGH_COURTS.find((h) => h.code === code || h.name.toLowerCase().includes(String(code).toLowerCase())) || null;
  },

  getCaseTypesForHighCourt(highCourtCode) {
    // Returns High Court specific taxonomy
    return HIGH_COURT_CASE_TYPES;
  },

  getCaseTypesForDistrictEstablishment(establishmentType = "DISTRICT_SESSIONS") {
    const key = String(establishmentType).toUpperCase().replace(/[^A-Z_]/g, "_");
    return DISTRICT_ESTABLISHMENT_CASE_TYPES[key] || DISTRICT_ESTABLISHMENT_CASE_TYPES.DISTRICT_SESSIONS;
  },

  /**
   * Validate 16-Character eCourts CNR (Case Number Record)
   * Format: 2-char State + 2-char District + 2-digit Est + 6-digit Case Number + 4-digit Year
   * Example: UPGZ010012342026
   */
  validateCNR(cnrNumber = "") {
    if (!cnrNumber || typeof cnrNumber !== "string") {
      return { valid: false, message: "CNR number is required." };
    }
    const clean = cnrNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length !== 16) {
      return {
        valid: false,
        message: `CNR Number must be exactly 16 alphanumeric characters (Current: ${clean.length}).`,
      };
    }
    const regex = /^[A-Z]{4}\d{12}$/;
    if (!regex.test(clean)) {
      return {
        valid: false,
        message: "Invalid CNR Format. Must be: 4 letters (State+District) + 2 digits (Est) + 6 digits (Number) + 4 digits (Year). Example: UPGZ010012342026",
      };
    }
    return {
      valid: true,
      cleanCNR: clean,
      stateDistrictCode: clean.slice(0, 4),
      establishmentCode: clean.slice(4, 6),
      caseNumber: clean.slice(6, 12),
      year: clean.slice(12, 16),
      message: "Valid 16-character eCourts CNR Number.",
    };
  },

  formatSpecialtyBadges(specialtyIdsArray = []) {
    if (!Array.isArray(specialtyIdsArray) || specialtyIdsArray.length === 0) {
      return [{ id: "DEFAULT", name: "General Litigation & Legal Advisory", rankIcon: "⚖️" }];
    }
    return specialtyIdsArray.map((id) => {
      const found = CORE_SPECIALTIES.find((s) => s.id === id || s.name === id);
      if (found) return found;
      return {
        id: String(id || "SPECIALTY"),
        name: String(id || "General Practice"),
        rankIcon: "⚖️",
      };
    });
  },
};

export default JudiciaryMasterService;
