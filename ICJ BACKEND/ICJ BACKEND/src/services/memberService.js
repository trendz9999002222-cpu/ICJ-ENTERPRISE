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
    const year = new Date().getFullYear();
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const aadhaarClean = String(member.aadhaar || member.aadhar || "").replace(/\D/g, "").slice(0, 12);
    const birthYearVal = member.birthYear || member.birth_year || "";
    const memberLevel = member.member_level || autoAssignMembershipLevel(member);
    const statusVal = member.verification_status || "Pending Verification";

    const newMember = {
      member_id: member.member_id || `ICJ-${year}-${uniqueSuffix}`,
      registration_date: new Date().toISOString(),
      verification_status: VALID_STATUSES.includes(statusVal) ? statusVal : "Pending Verification",
      member_type: member.memberType || member.member_type || "individual",
      member_level: memberLevel,
      ...member,
      aadhaar: aadhaarClean,
      aadhar: aadhaarClean,
      birthYear: birthYearVal,
      birth_year: birthYearVal,
      age: member.age || "",
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