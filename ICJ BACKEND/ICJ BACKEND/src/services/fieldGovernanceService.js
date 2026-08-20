/**
 * ICJ ENTERPRISE PLATFORM — FIELD GOVERNANCE SERVICE
 * Centralized governance engine controlling field visibility, requirements, editability,
 * role visibility, nationality visibility, and entity type scoping dynamically without code changes.
 */

const STORAGE_KEY = "icj_field_governance_rules_v1";

export const DEFAULT_FIELD_CONFIGS = {
  // --- INDIVIDUAL NAME ENGINE ---
  prefix: {
    label: "Prefix",
    display: true,
    mandatory: false,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: true,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: false,
    visibleIndian: true,
    visibleInternational: true,
  },
  firstName: {
    label: "First Name",
    display: true,
    mandatory: true,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: true,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: false,
    visibleIndian: true,
    visibleInternational: true,
  },
  middleName: {
    label: "Middle Name",
    display: true,
    mandatory: false,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: true,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: false,
    visibleIndian: true,
    visibleInternational: true,
  },
  lastName: {
    label: "Last Name / Surname",
    display: true,
    mandatory: true,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: true,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: false,
    visibleIndian: true,
    visibleInternational: true,
  },
  preferredName: {
    label: "Preferred / Display Name",
    display: true,
    mandatory: false,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: true,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: false,
    visibleIndian: true,
    visibleInternational: true,
  },

  // --- ORGANISATION ENGINE ---
  organisationName: {
    label: "Organisation Legal Name",
    display: true,
    mandatory: true,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: true,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: false,
    visibleOrganisation: true,
    visibleIndian: true,
    visibleInternational: true,
  },
  authSignatoryFirstName: {
    label: "Signatory First Name",
    display: true,
    mandatory: true,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: false,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: false,
    visibleOrganisation: true,
    visibleIndian: true,
    visibleInternational: true,
  },
  authSignatoryLastName: {
    label: "Signatory Last Name",
    display: true,
    mandatory: true,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: false,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: false,
    visibleOrganisation: true,
    visibleIndian: true,
    visibleInternational: true,
  },

  // --- CONTACT & PERSONAL ENGINE ---
  email: {
    label: "Email Address",
    display: true,
    mandatory: true,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: false,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: true,
    visibleIndian: true,
    visibleInternational: true,
  },
  mobile: {
    label: "Primary Mobile Number",
    display: true,
    mandatory: true,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: false,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: true,
    visibleIndian: true,
    visibleInternational: true,
  },
  whatsapp: {
    label: "WhatsApp Number",
    display: true,
    mandatory: false,
    readOnly: false,
    editable: true,
    searchable: false,
    visiblePublic: false,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: true,
    visibleIndian: true,
    visibleInternational: true,
  },
  gender: {
    label: "Gender Identity",
    display: true,
    mandatory: false,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: false,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: false,
    visibleIndian: true,
    visibleInternational: true,
  },
  birthYear: {
    label: "Birth Year",
    display: true,
    mandatory: true,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: false,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: false,
    visibleIndian: true,
    visibleInternational: true,
  },

  // --- IDENTITY & GOVERNMENT ENGINE ---
  profession: {
    label: "Profession",
    display: true,
    mandatory: false,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: true,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: true,
    visibleIndian: true,
    visibleInternational: true,
  },
  aadhaar: {
    label: "Aadhaar Number",
    display: true,
    mandatory: false,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: false,
    visibleMember: false,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: false,
    visibleIndian: true,
    visibleInternational: false,
  },
  pan: {
    label: "PAN Number",
    display: true,
    mandatory: false,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: false,
    visibleMember: false,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: true,
    visibleIndian: true,
    visibleInternational: false,
  },
  gst: {
    label: "GSTIN / GST Number",
    display: true,
    mandatory: false,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: false,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: true,
    visibleIndian: true,
    visibleInternational: false,
  },
  passport: {
    label: "Passport Number",
    display: true,
    mandatory: false,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: false,
    visibleMember: false,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: false,
    visibleIndian: true,
    visibleInternational: true,
  },

  // --- PROFESSIONAL CREDENTIALS ENGINE ---
  registrationAuthority: {
    label: "Professional Registration Authority",
    display: true,
    mandatory: false,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: true,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: true,
    visibleIndian: true,
    visibleInternational: true,
  },
  registrationNumber: {
    label: "Registration / Enrollment Number",
    display: true,
    mandatory: false,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: true,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: true,
    visibleIndian: true,
    visibleInternational: true,
  },
  experience: {
    label: "Professional Experience (Years)",
    display: true,
    mandatory: false,
    readOnly: false,
    editable: true,
    searchable: true,
    visiblePublic: true,
    visibleMember: true,
    visibleStaff: true,
    visibleOfficer: true,
    visibleAdmin: true,
    visibleIndividual: true,
    visibleOrganisation: false,
    visibleIndian: true,
    visibleInternational: true,
  },
};

class FieldGovernanceService {
  constructor() {
    this.configs = this.loadConfigs();
  }

  loadConfigs() {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return { ...DEFAULT_FIELD_CONFIGS, ...JSON.parse(stored) };
        }
      } catch (e) {
        console.warn("FieldGovernanceService: Failed to read localStorage", e);
      }
    }
    return { ...DEFAULT_FIELD_CONFIGS };
  }

  saveConfigs(updatedConfigs) {
    this.configs = { ...updatedConfigs };
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.configs));
      } catch (e) {
        console.error("FieldGovernanceService: Failed to save to localStorage", e);
      }
    }
  }

  getAllConfigs() {
    return this.configs;
  }

  getFieldConfig(fieldName) {
    return this.configs[fieldName] || {
      label: fieldName,
      display: true,
      mandatory: false,
      readOnly: false,
      editable: true,
      visiblePublic: true,
      visibleMember: true,
      visibleStaff: true,
      visibleOfficer: true,
      visibleAdmin: true,
      visibleIndividual: true,
      visibleOrganisation: true,
      visibleIndian: true,
      visibleInternational: true,
    };
  }

  updateFieldConfig(fieldName, updates) {
    const current = this.getFieldConfig(fieldName);
    const updated = { ...current, ...updates };
    const all = { ...this.configs, [fieldName]: updated };
    this.saveConfigs(all);
    return updated;
  }

  resetToDefaults() {
    this.saveConfigs(DEFAULT_FIELD_CONFIGS);
    return this.configs;
  }

  /**
   * Evaluate if a field is visible given the context
   * @param {string} fieldName 
   * @param {object} context { memberType: 'individual'|'organisation', role: 'admin'|'member'|..., isIndian: true|false }
   */
  isFieldVisible(fieldName, context = {}) {
    const cfg = this.getFieldConfig(fieldName);
    if (!cfg.display) return false;

    // Check Entity Type Scoping
    if (context.memberType === "organisation" && cfg.visibleOrganisation === false) return false;
    if (context.memberType === "individual" && cfg.visibleIndividual === false) return false;

    // Check Nationality Scoping
    if (context.isIndian === true && cfg.visibleIndian === false) return false;
    if (context.isIndian === false && cfg.visibleInternational === false) return false;

    // Check Role Visibility
    if (context.role === "public" && cfg.visiblePublic === false) return false;
    if (context.role === "member" && cfg.visibleMember === false) return false;

    return true;
  }

  /**
   * Evaluate if a field is mandatory
   */
  isFieldRequired(fieldName, context = {}) {
    if (!this.isFieldVisible(fieldName, context)) return false;
    const cfg = this.getFieldConfig(fieldName);
    return Boolean(cfg.mandatory);
  }

  /**
   * Evaluate if a field is read-only
   */
  isFieldReadOnly(fieldName) {
    const cfg = this.getFieldConfig(fieldName);
    if (cfg.readOnly) return true;
    if (cfg.editable === false) return true;
    return false;
  }

  /**
   * Platform Wording & Dynamic Label Governance
   */
  getWording(key, fallbackText) {
    if (typeof window === "undefined") return fallbackText;
    try {
      const raw = window.localStorage.getItem("icj_platform_wording_v1");
      if (!raw) return fallbackText;
      const parsed = JSON.parse(raw);
      return parsed[key] || fallbackText;
    } catch {
      return fallbackText;
    }
  }

  setWording(key, newText) {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("icj_platform_wording_v1");
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[key] = newText;
      window.localStorage.setItem("icj_platform_wording_v1", JSON.stringify(parsed));
    } catch (e) {
      console.error("Failed to save wording override", e);
    }
  }

  getAllWordings() {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem("icj_platform_wording_v1");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
}

export default new FieldGovernanceService();
