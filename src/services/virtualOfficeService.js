/**
 * ICJ Virtual Office Service — Module 3
 *
 * Provides digital office board, active case board, client queue, document vault, and verification badge.
 */

const VIRTUAL_OFFICE_KEY = "icj_virtual_offices";

const readStore = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const writeStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

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
        courtJurisdiction: "District & High Court, Uttar Pradesh",
        specializations: ["Property & Real Estate", "Civil Disputes", "Constitutional Writs"],
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
    const updated = offices.map((o) => {
      if (o.memberId === memberId) {
        return { ...o, ...updates, updatedAt: new Date().toISOString() };
      }
      return o;
    });
    writeStore(VIRTUAL_OFFICE_KEY, updated);
    return this.getOfficeForMember(memberId);
  },
};

export default VirtualOfficeService;
