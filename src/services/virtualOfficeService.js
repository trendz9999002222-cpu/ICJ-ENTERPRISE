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
  { id: "OFF-HC-01", type: "HighCourt", name: "High Court of Judicature Chamber", address: "Chamber #108, Lucknow Bench Block", city: "Lucknow", state: "Uttar Pradesh" },
  { id: "OFF-SC-01", type: "SupremeCourt", name: "Supreme Court Practice Office", address: "Chamber #12, Lawyers Chambers, Supreme Court", city: "New Delhi", state: "Delhi" },
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
        courtJurisdiction: "District Court, High Court & Supreme Court",
        specializations: ["Property & Real Estate", "Civil Disputes", "Constitutional Writs"],
        officeLocations: DEFAULT_COURT_OFFICES,
        seniorMentor: "Adv. Ramesh Chandra Verma (Senior Advocate & Mentor)",
        juniorsList: [
          { id: "JR-01", memberId: "26ICJ08AA0001", name: "Pooja Verma", designation: "Junior Associate", assignedOffice: "High Court of Judicature Chamber", barId: "UP/2022/8812", mobile: "+91 9839012345" },
          { id: "JR-02", memberId: "26ICJ08AA0002", name: "Siddharth Mehta", designation: "Legal Intern", assignedOffice: "Supreme Court Practice Office", barId: "DL/2024/1102", mobile: "+91 9123456789" },
        ],
        empanelledBadgeStatus: "VERIFIED_EMPANELLED",
        verificationQrCode: `https://icj.org.in/verify/${memberId || "DEMO"}`,
        officeAddress: "Virtual Chamber #402, ICJ Digital High Court Complex",
        workingHours: "10:00 AM - 06:00 PM (Mon-Sat)",
        clientAppointmentsCount: 14,
        activeCasesCount: 8,
        aiDraftsGeneratedCount: 32,
        documentsVaultCount: 19,
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
