import { safeString, safeArray } from "./safeAccess.js";

/**
 * SchemaValidator — ICJ Enterprise Platform
 * Schema Validation & Auto-Healing Engine.
 * Sanitizes and repairs raw data records from LocalStorage, APIs, or Excel Imports
 * BEFORE reaching the React component rendering tree.
 */

export const SchemaValidator = {
  /**
   * Auto-Heal Single Member / Advocate Record
   */
  sanitizeMember(raw = {}) {
    if (!raw || typeof raw !== "object") {
      return {
        id: "26ICJ-TEMP-001",
        member_id: "26ICJ-TEMP-001",
        fullName: "Empaneled Member",
        name: "Empaneled Member",
        email: "— N/A (Enter Email) —",
        mobile: "— N/A —",
        city: "— N/A (Select District) —",
        district: "— N/A (Select District) —",
        state: "UP",
        profession: "CRIMINAL_BAIL",
        unlockedSpecialties: ["CRIMINAL_BAIL"],
        verification_status: "Verified",
      };
    }

    return {
      ...raw,
      id: raw.id || raw.member_id || raw.uuid || "26ICJ-TEMP-001",
      member_id: raw.member_id || raw.id || "26ICJ-TEMP-001",
      fullName: safeString(raw.fullName || raw.full_name || raw.name, "Empaneled Member"),
      name: safeString(raw.name || raw.fullName || raw.full_name, "Empaneled Member"),
      email: safeString(raw.email, "— N/A (Enter Email) —"),
      mobile: safeString(raw.mobile, "— N/A —"),
      city: safeString(raw.city || raw.district, "— N/A (Select District) —"),
      district: safeString(raw.district || raw.city, "— N/A (Select District) —"),
      state: safeString(raw.state, "UP"),
      profession: safeString(raw.profession, "CRIMINAL_BAIL"),
      unlockedSpecialties: safeArray(raw.unlockedSpecialties).length > 0 ? safeArray(raw.unlockedSpecialties) : ["CRIMINAL_BAIL"],
      verification_status: safeString(raw.verification_status, "Verified"),
    };
  },

  /**
   * Auto-Heal List of Member / Advocate Records
   */
  sanitizeMemberList(list = []) {
    const arr = safeArray(list);
    return arr.map((item) => this.sanitizeMember(item));
  },
};

export default SchemaValidator;
