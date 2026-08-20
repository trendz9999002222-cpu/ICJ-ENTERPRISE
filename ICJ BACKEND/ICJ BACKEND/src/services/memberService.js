import {
  getMembers,
  addMember,
  updateMember,
  deleteMember,
} from "./database.js";
import SeedEcosystemService from "./seedEcosystemService.js";
import { ENTERPRISE_SEED_USERS } from "../data/seedUsers.js";

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
 * Example: "ICJ-2026-MEM-0001" = 1st member registered in Aug 2026
 *
 * Capacity: 676 groups × 9999 = 6,759,324 unique IDs per month
 *
 * @param {Array}  existingList  - Array of all current member objects
 * @returns {string}  New unique Member Serial ID
 */
export const generateMemberId = (existingList = [], role = "member") => {
  const total = (Array.isArray(existingList) ? existingList.length : 0) + 1;
  const seq = String(total).padStart(4, "0");

  if (role === "franchise") {
    return `26FRZ08AA${seq}`;
  }
  if (role === "advocate") {
    return `26ICJ08AA${seq}`;
  }
  if (role === "admin" || role === "super_admin") {
    return role === "super_admin" ? `26SAD08AA${seq}` : `26ADM08AA${seq}`;
  }
  return `26CLT08AA${seq}`;
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
    const list = await getMembers();
    if (!Array.isArray(list) || list.length < ENTERPRISE_SEED_USERS.length) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem("icj_members", JSON.stringify(ENTERPRISE_SEED_USERS));
        }
      } catch (e) {}
      return ENTERPRISE_SEED_USERS;
    }
    return list;
  },

  async create(member) {
    // ── RULE 1: Email अनिवार्य है ──────────────────────────────────────────
    const emailVal = String(member.email || "").trim().toLowerCase();
    if (!emailVal) {
      throw new Error("Email address is required. Registration cannot proceed without an email.");
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      throw new Error("Please enter a valid email address.");
    }

    // ── RULE 2: एक Email = एक Registration ─────────────────────────────────
    const existing = await getMembers();
    const duplicate = existing.find(
      (m) => String(m.email || "").trim().toLowerCase() === emailVal
    );
    if (duplicate) {
      throw new Error(
        `This email address is already registered (Member ID: ${duplicate.member_id || duplicate.id}). Each email can only be used for one registration.`
      );
    }

    // Pass full existing list so new ID is date-aware and duplicate-safe
    const permanentId = generateMemberId(existing || []);

    const aadhaarClean = String(member.aadhaar || member.aadhar || "").replace(/\D/g, "").slice(0, 12);
    const birthYearVal = member.birthYear || member.birth_year || "";
    if (birthYearVal) {
      const currentYear = new Date().getFullYear();
      const minBirthYear = 1925 + (currentYear - 2026);
      const maxBirthYear = currentYear - 10;
      const yr = Number(birthYearVal);
      if (isNaN(yr) || yr < minBirthYear || yr > maxBirthYear) {
        throw new Error(`Birth Year must be between ${minBirthYear} and ${maxBirthYear}.`);
      }
    }
    const rawLevel = member.member_level || member.memberLevel || autoAssignMembershipLevel(member);
    const memberLevel = normalizeMembershipLevel(rawLevel);
    const statusVal = member.verification_status || "Pending Verification";

    const newMember = {
      id: member.id || permanentId,
      member_id: permanentId,
      memberId: permanentId,
      email: emailVal,
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

    const res = await addMember(newMember);

    // Trigger central event notification
    import("./notificationService.js").then((mod) => {
      const ns = mod.default || mod.NotificationService;
      ns.create({
        title: "New Member Registered",
        category: "Members",
        message: `Member ${newMember.fullName} (ID: ${newMember.memberId}) registered successfully.`,
        type: "Info",
        status: "Unread",
        date: new Date().toLocaleDateString("en-IN"),
        route: "/membership"
      }).catch(() => {});
    });

    return res;
  },

  async update(id, data) {
    if (data.verification_status && !VALID_STATUSES.includes(data.verification_status)) {
      throw new Error(`Invalid status: ${data.verification_status}. Valid statuses: ${VALID_STATUSES.join(", ")}`);
    }
    const res = await updateMember(id, data);
    if (data.verification_status === "Approved") {
      import("./notificationService.js").then((mod) => {
        const ns = mod.default || mod.NotificationService;
        ns.create({
          title: "Member Verification Approved",
          category: "Members",
          message: `Member verification approved for ${id}.`,
          type: "Info",
          status: "Unread",
          date: new Date().toLocaleDateString("en-IN"),
          route: "/member-verification"
        }).catch(() => {});
      });
    }
    return res;
  },

  async searchLeads(filters = {}) {
    const all = await getMembers();
    return all.filter((m) => {
      const isLead = m.purposeCode === "PROBLEM" || String(m.purpose || "").includes("Problem");
      if (!isLead) return false;

      if (filters.category && !(m.problemCategories || []).includes(filters.category) && m.problemCategory !== filters.category) {
        return false;
      }
      if (filters.state && m.problemState !== filters.state) return false;
      if (filters.district && m.problemDistrict !== filters.district) return false;
      if (filters.pincode && m.problemPincode !== filters.pincode) return false;
      if (filters.service && !(m.intakeServices || []).includes(filters.service)) return false;

      return true;
    });
  },

  async remove(id) {
    return await deleteMember(id);
  },
};

export default MemberService;