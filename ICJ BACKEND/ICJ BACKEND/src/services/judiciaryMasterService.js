/**
 * JudiciaryMasterService — ICJ Enterprise Platform
 * Master Repository for Indian Judiciary 10-Forum Classification & 12 Practice Core Specialties.
 */

export const JUDICIAL_FORUMS = [
  { rank: 1, id: "SUPREME_COURT", name: "Supreme Court of India (SLPs & Constitutional Bench)", badgeColor: "#7c3aed" },
  { rank: 2, id: "HIGH_COURT", name: "High Courts (Writs, Sec 482 CrPC, Appeals)", badgeColor: "#1d4ed8" },
  { rank: 3, id: "DISTRICT_COURT", name: "District & Sessions Courts (Criminal Trials, Bail & Civil Suits)", badgeColor: "#059669" },
  { rank: 4, id: "TEHSIL_SDM", name: "Tehsil & SDM Courts (Revenue Mutation & Sec 144 Executive Suits)", badgeColor: "#d97706" },
  { rank: 5, id: "NCLT_NCLAT", name: "NCLT / NCLAT (Corporate Insolvency IBC 2016 & Mergers)", badgeColor: "#2563eb" },
  { rank: 6, id: "NGT", name: "NGT (National Green Tribunal - Environmental Laws)", badgeColor: "#047857" },
  { rank: 7, id: "DRT_DRAT", name: "DRT / DRAT (Debts Recovery & SARFAESI Banking)", badgeColor: "#b91c1c" },
  { rank: 8, id: "RERA_CONSUMER", name: "RERA Real Estate & Consumer Protection Tribunal", badgeColor: "#c026d3" },
  { rank: 9, id: "CAT", name: "CAT (Central Administrative Tribunal - Service & Pension)", badgeColor: "#4f46e5" },
  { rank: 10, id: "LABOUR_COURT", name: "Labour & Industrial Disputes Tribunal", badgeColor: "#475569" },
];

export const CORE_SPECIALTIES = [
  { id: "CRIMINAL_BAIL", name: "Criminal Law & Midnight Bail / FIR Quashing (Sec 482 CrPC)", rankIcon: "🥇" },
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

export const JudiciaryMasterService = {
  getForums() {
    return JUDICIAL_FORUMS;
  },

  getSpecialties() {
    return CORE_SPECIALTIES;
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
