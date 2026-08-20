import { MemberService } from "./memberService.js";

const PENDING_REGISTRATIONS_KEY = "icj_pending_self_registrations";

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
    console.error("MemberBatchService setStore error", e);
  }
};

export const MemberBatchService = {
  /**
   * Generate & Download Pre-Formatted CSV/Excel Template
   */
  downloadTemplate() {
    const csvHeader = "NamePrefix,FirstName,LastName,BirthYear,Gender,Aadhaar,PAN,Profession,CourtName,CasteCategory,Mobile,Email,State,District,Pincode,Address\n";
    const sampleRow = "Adv.,Rajesh,Sharma,1985,Male,123456789012,ABCDE1234F,Advocate,High Court Lucknow Bench,General,9876543210,adv.rajesh@icj.law,Uttar Pradesh,Lucknow,226001,Hazratganj Lucknow\n";
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvHeader + sampleRow);

    if (typeof window !== "undefined") {
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", "ICJ_Member_Batch_Import_Template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  /**
   * Parse CSV File Text into Member Objects
   */
  parseCSVText(csvText) {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const results = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length >= 3) {
        results.push({
          id: `BATCH-${Date.now()}-${i}`,
          namePrefix: cols[0] || "Mr.",
          firstName: cols[1] || "",
          lastName: cols[2] || "",
          name: `${cols[0] || ""} ${cols[1] || ""} ${cols[2] || ""}`.trim(),
          birthYear: cols[3] || "1990",
          gender: cols[4] || "Male",
          aadhaar: cols[5] || "",
          pan: cols[6] || "",
          profession: cols[7] || "Advocate",
          courtName: cols[8] || "District & Sessions Court",
          casteCategory: cols[9] || "General",
          mobile: cols[10] || "",
          email: cols[11] || "",
          state: cols[12] || "Uttar Pradesh",
          district: cols[13] || "Lucknow",
          pincode: cols[14] || "226001",
          address: cols[15] || "",
          status: "Active",
          verification_status: "Verified",
        });
      }
    }
    return results;
  },

  /**
   * Batch Import Parsed Members directly into Enterprise Database
   */
  async importBatch(membersArray) {
    let importedCount = 0;
    for (const memberData of membersArray) {
      await MemberService.create(memberData);
      importedCount++;
    }
    return { success: true, count: importedCount };
  },

  /**
   * Submit Online Self-Registration (Lands in Pending Admin Queue)
   */
  submitSelfRegistration(data) {
    const pending = getStore(PENDING_REGISTRATIONS_KEY, []);
    const entry = {
      id: `SELF-REG-${Date.now()}`,
      ...data,
      submittedAt: new Date().toISOString(),
      status: "PENDING_APPROVAL",
    };
    pending.unshift(entry);
    setStore(PENDING_REGISTRATIONS_KEY, pending);
    return entry;
  },

  /**
   * Get Pending Self-Registrations Queue
   */
  getPendingSelfRegistrations() {
    return getStore(PENDING_REGISTRATIONS_KEY, []);
  },

  /**
   * 1-Click Approve Self-Registration
   */
  async approveSelfRegistration(id) {
    const pending = getStore(PENDING_REGISTRATIONS_KEY, []);
    const targetIdx = pending.findIndex((item) => item.id === id);
    if (targetIdx !== -1) {
      const target = pending[targetIdx];
      await MemberService.create({
        ...target,
        status: "Active",
        verification_status: "Verified",
      });
      pending.splice(targetIdx, 1);
      setStore(PENDING_REGISTRATIONS_KEY, pending);
      return { success: true, memberName: target.name || target.firstName };
    }
    return { success: false };
  },
};

export default MemberBatchService;
