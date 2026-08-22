/**
 * ICJ Virtual Office Service — Module 3
 *
 * Provides digital office board, active case board, client queue, document vault, and verification badge.
 */

const VIRTUAL_OFFICE_KEY = "icj_virtual_offices";

const readStore = (key) => {
  try {
    const storage = typeof window !== "undefined" ? window.localStorage : globalThis.localStorage;
    return JSON.parse(storage ? storage.getItem(key) || "[]" : "[]");
  } catch { return []; }
};
const writeStore = (key, val) => {
  try {
    const storage = typeof window !== "undefined" ? window.localStorage : globalThis.localStorage;
    if (storage) storage.setItem(key, JSON.stringify(val));
  } catch { /* ignore */ }
};

export const DEFAULT_COURT_OFFICES = [
  { id: "OFF-DIST-01", type: "DistrictCourt", name: "District & Sessions Court Chamber", address: "Chamber #42, District Court Complex", city: "Lucknow", state: "Uttar Pradesh" },
  { id: "OFF-TEH-01", type: "TehsilCourt", name: "Sadar Tehsil & SDM Executive Court", address: "Chamber #05, SDM Court Compound", city: "Lucknow", state: "Uttar Pradesh" },
  { id: "OFF-HC-01", type: "HighCourt", name: "High Court of Judicature Chamber", address: "Chamber #108, Lucknow Bench Block", city: "Lucknow", state: "Uttar Pradesh" },
  { id: "OFF-SC-01", type: "SupremeCourt", name: "Supreme Court Practice Office", address: "Chamber #12, Lawyers Chambers, Supreme Court", city: "New Delhi", state: "Delhi" },
  { id: "OFF-NGT-01", type: "Tribunal", name: "National Green Tribunal (NGT) Chamber", address: "Faridkot House, Copernicus Marg", city: "New Delhi", state: "Delhi" },
];

export const DEFAULT_RANKED_SPECIALIZATIONS = [
  { rank: 1, name: "Criminal Law & FIR Bail Matters", label: "🥇 Primary Core Expertise" },
  { rank: 2, name: "Property & Revenue Litigation", label: "🥈 Secondary Specialty" },
  { rank: 3, name: "Constitutional & High Court Writs", label: "🥉 Tertiary Specialty" },
  { rank: 4, name: "Arbitration & Commercial Contracts", label: "🏅 Additional Practice Area" },
];

export const VirtualOfficeService = {
  getOfficeForMember(memberId, memberName = "ICJ Advocate") {
    const offices = readStore(VIRTUAL_OFFICE_KEY);
    let office = offices.find((o) => o.memberId === memberId);

    if (!office) {
      // Default initial virtual office
      office = {
        officeId: `VO-${memberId || "DEMO"}`,
        memberId,
        advocateName: memberName,
        barEnrollmentNo: `UP/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        courtJurisdiction: "District Court, High Court, Supreme Court, SDM Court & Tribunals",
        specializations: ["Property & Real Estate", "Civil Disputes", "Constitutional Writs"],
        rankedSpecializations: DEFAULT_RANKED_SPECIALIZATIONS,
        officeLocations: DEFAULT_COURT_OFFICES,
        seniorMentor: "Empaneled Senior Mentor",
        teamQuotaLimit: 5,
        juniorsList: [],
        empanelledBadgeStatus: "VERIFIED_EMPANELLED",
        verificationQrCode: `https://icj.org.in/verify/${memberId || "DEMO"}`,
        officeAddress: "Virtual Chamber #402, ICJ Digital High Court Complex",
        workingHours: "10:00 AM - 06:00 PM (Mon-Sat)",
        clientAppointmentsCount: 0,
        activeCasesCount: 0,
        aiDraftsGeneratedCount: 0,
        documentsVaultCount: 0,
        updatedAt: new Date().toISOString(),
      };
      writeStore(VIRTUAL_OFFICE_KEY, [...offices, office]);
    }

    return office;
  },

  updateOffice(memberId, updates) {
    const offices = readStore(VIRTUAL_OFFICE_KEY);
    let found = false;
    const updated = offices.map((o) => {
      if (o.memberId === memberId) {
        found = true;
        return { ...o, ...updates, updatedAt: new Date().toISOString() };
      }
      return o;
    });

    if (!found) {
      const baseOffice = this.getOfficeForMember(memberId);
      const newOffice = { ...baseOffice, ...updates, updatedAt: new Date().toISOString() };
      writeStore(VIRTUAL_OFFICE_KEY, [...offices.filter(o => o.memberId !== memberId), newOffice]);
      return newOffice;
    }

    writeStore(VIRTUAL_OFFICE_KEY, updated);
    return this.getOfficeForMember(memberId);
  },
};

export default VirtualOfficeService;
