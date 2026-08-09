import {
  getMembers,
  addMember,
  updateMember,
  deleteMember,
} from "./database.js";

const VALID_STATUSES = [
  "Draft",
  "Submitted",
  "Pending Verification",
  "Under Review",
  "Approved",
  "Rejected",
  "Suspended",
  "Archived",
];

/**
 * Convert a 0-based group index to a 2-letter alpha code.
 * 0 → "AA", 1 → "AB", ... 25 → "AZ", 26 → "BA", ... 675 → "ZZ"
 */
const alphaGroupFromIndex = (index) => {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const first = LETTERS[Math.floor(index / 26)];
  const second = LETTERS[index % 26];
  return `${first}${second}`;
};

/**
 * Parse the alpha group code back to a 0-based index.
 * "AA" → 0, "AB" → 1, "AZ" → 25, "BA" → 26
 */
const alphaGroupToIndex = (code = "AA") => {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const c = String(code).toUpperCase();
  return LETTERS.indexOf(c[0]) * 26 + LETTERS.indexOf(c[1]);
};

/**
 * Generate the new Smart Date-Encoded Member Serial ID.
 *
 * Format: YYICJMMxxNNNN
 *   YY   = last 2 digits of current year     (e.g. "26")
 *   ICJ  = fixed brand prefix
 *   MM   = 2-digit current month             (e.g. "08")
 *   xx   = 2-letter alpha group              (AA, AB … ZZ)
 *   NNNN = 4-digit sequential within group   (0001–9999)
 *
 * Example: "26ICJ08AA0001" = 1st member registered in Aug 2026
 *
 * Capacity: 676 groups × 9999 = 6,759,324 unique IDs per month
 *
 * @param {Array}  existingList  - Array of all current member objects
 * @returns {string}  New unique Member Serial ID
 */
export const generateMemberId = (existingList = []) => {
  const now = new Date();
  const YY = String(now.getFullYear()).slice(-2);          // "26"
  const MM = String(now.getMonth() + 1).padStart(2, "0"); // "08"
  const prefix = `${YY}ICJ${MM}`;

  // Count how many members already have IDs starting with this month's prefix
  const monthMembers = (Array.isArray(existingList) ? existingList : []).filter(
    (m) => String(m.member_id || m.id || "").startsWith(prefix)
  );

  // Total registered this month so far (0-based)
  const totalThisMonth = monthMembers.length; // 0, 1, 2 ...

  // Sequential position (1-based)
  const sequential = (totalThisMonth % 9999) + 1; // 1 → 9999, then resets
  const groupIndex = Math.floor(totalThisMonth / 9999); // 0=AA, 1=AB, ...

  if (groupIndex >= 676) {
    // ZZ group full: 676 × 9999 = 6,759,324 members/month — practically impossible
    throw new Error("ICJ: Monthly member ID capacity exceeded (>6.7M). Contact system administrator.");
  }

  const alphaGroup = alphaGroupFromIndex(groupIndex); // "AA", "AB", etc.
  const seqStr = String(sequential).padStart(4, "0");  // "0001"

  return `${prefix}${alphaGroup}${seqStr}`; // e.g. "26ICJ08AA0001"
};

// Keep the old ID normalizer for backward compatibility with existing records
export const normalizeMemberId = (member = {}) => {
  if (!member || typeof member !== "object") return "";
  return member.member_id || member.memberId || member.id || member.members || member.uuid || "";
};

export const normalizeMemberType = (val) => {
  const s = String(val || "").trim().toLowerCase();
  if (!s) return "General";
  if (s === "individual") return "Individual";
  if (s === "organisation" || s === "organization") return "Organisation";
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
};

export const normalizeMembershipLevel = (val) => {
  const s = String(val || "").trim().toUpperCase();
  if (s === "ENTERPRISE" || s === "EXECUTIVE") return "EXECUTIVE";
  if (s === "PROFESSIONAL" || s === "PRO") return "PRO";
  if (s === "ADVANCED") return "ADVANCED";
  return "BASIC";
};


const autoAssignMembershipLevel = (member) => {
  const role = (member.role || "").toLowerCase();
  const profession = (member.profession || "").toLowerCase();
  const exp = parseInt(member.experience || "0", 10);
  const isOrg = member.memberType === "organisation" || member.member_type === "organisation";

  if (isOrg || role === "trust_official" || role === "admin" || exp >= 15) {
    return "EXECUTIVE";
  }
  if (profession.includes("advocate") || profession.includes("lawyer") || exp >= 5) {
    return "PRO";
  }
  if (exp >= 2) {
    return "ADVANCED";
  }
  return "BASIC";
};

export const MemberService = {
  getValidStatuses() {
    return VALID_STATUSES;
  },

  formatAadhaar(val = "") {
    const clean = String(val).replace(/\D/g, "").slice(0, 12);
    return clean.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3").trim();
  },

  validatePan(pan = "") {
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return regex.test(String(pan).trim().toUpperCase());
  },

  async getAll() {
    return await getMembers();
  },

  async create(member) {
    const existing = await getMembers();
    // Pass full existing list so new ID is date-aware and duplicate-safe
    const permanentId = generateMemberId(existing || []);

    const aadhaarClean = String(member.aadhaar || member.aadhar || "").replace(/\D/g, "").slice(0, 12);
    const birthYearVal = member.birthYear || member.birth_year || "";
    const rawLevel = member.member_level || member.memberLevel || autoAssignMembershipLevel(member);
    const memberLevel = normalizeMembershipLevel(rawLevel);
    const statusVal = member.verification_status || "Pending Verification";

    const newMember = {
      id: member.id || permanentId,
      member_id: permanentId,
      memberId: permanentId,
      registration_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      verification_status: VALID_STATUSES.includes(statusVal) ? statusVal : "Pending Verification",
      member_type: normalizeMemberType(member.memberType || member.member_type || "individual"),
      member_level: memberLevel,
      status: member.status || "Active",
      namePrefix: member.namePrefix || member.name_prefix || "",
      name_prefix: member.namePrefix || member.name_prefix || "",
      gender: member.gender || "",
      dob: member.dob || "",
      birthYear: birthYearVal,
      birth_year: birthYearVal,
      age: member.age || "",
      purpose: member.purpose || "",
      problemCategory: member.problemCategory || "",
      serviceCategory: member.serviceCategory || "",
      franchiseCity: member.franchiseCity || "",
      franchiseMessage: member.franchiseMessage || member.franchiseMsg || "",
      ...member,
      aadhaar: aadhaarClean,
      aadhar: aadhaarClean,
    };

    return await addMember(newMember);
  },

  async update(id, data) {
    if (data.verification_status && !VALID_STATUSES.includes(data.verification_status)) {
      throw new Error(`Invalid status: ${data.verification_status}. Valid statuses: ${VALID_STATUSES.join(", ")}`);
    }
    return await updateMember(id, data);
  },

  async remove(id) {
    return await deleteMember(id);
  },
};

export default MemberService;