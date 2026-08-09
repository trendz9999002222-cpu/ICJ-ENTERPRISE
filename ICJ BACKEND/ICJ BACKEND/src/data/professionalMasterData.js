/**
 * ICJ ENTERPRISE PLATFORM — NATIONAL PROFESSIONAL MASTER REGISTRY
 * Two-Level Professional Classification System for Legal & Non-Legal Stakeholders.
 */

export const PROFESSIONAL_CLASSIFICATION = {
  LEGAL: {
    label: "A. Advocate & Legal Professionals",
    categories: {
      "Judiciary": [
        "Retired Judge",
        "Judicial Officer",
        "Retired Judicial Officer",
        "Tribunal Member",
      ],
      "Advocates": [
        "Advocate",
        "Senior Advocate",
        "Advocate-on-Record",
        "Standing Counsel",
        "Panel Counsel",
        "Government Counsel",
        "Additional Government Counsel",
        "Public Prosecutor",
        "Additional Public Prosecutor",
        "Assistant Public Prosecutor",
        "Special Public Prosecutor",
        "Legal Aid Counsel",
      ],
      "Legal Services": [
        "Arbitrator",
        "Mediator",
        "Conciliator",
        "Notary",
        "Oath Commissioner",
        "Court Commissioner",
        "Receiver",
        "Resolution Professional",
        "Insolvency Professional",
      ],
      "Court Staff": [
        "Court Clerk",
        "Junior Clerk",
        "Senior Clerk",
        "Bench Clerk",
        "Reader",
        "Process Server",
        "Bailiff",
        "Court Manager",
      ],
      "Legal Documentation": [
        "Petition Writer",
        "Deed Writer",
        "Document Writer",
        "Drafting Specialist",
        "Translator",
        "Interpreter",
        "Typist",
      ],
      "Legal Education": [
        "Law Professor",
        "Law Lecturer",
        "Law Student",
        "Legal Researcher",
        "Legal Consultant",
      ],
    },
  },
  NON_LEGAL: {
    label: "B. Non-Advocate Professionals",
    categories: {
      "Finance & Banking": [
        "Chartered Accountant",
        "Cost Accountant",
        "Company Secretary",
        "GST Practitioner",
        "Income Tax Practitioner",
        "Tax Consultant",
        "Financial Consultant",
        "Auditor",
        "Banker",
        "Bank Manager",
        "Branch Manager",
        "Credit Officer",
        "Recovery Officer",
        "Insurance Advisor",
        "Investment Advisor",
      ],
      "Government": [
        "Government Officer",
        "Revenue Officer",
        "SDM",
        "Tehsildar",
        "Registrar",
        "Sub Registrar",
        "Patwari",
        "Lekhpal",
      ],
      "Police & Investigation": [
        "Police Officer",
        "Investigation Officer",
        "Vigilance Officer",
        "Retired Police Officer",
      ],
      "Engineering": [
        "Engineer",
        "Architect",
        "Surveyor",
        "Valuer",
        "GIS Expert",
        "IT Professional",
      ],
      "Business": [
        "Businessman",
        "Entrepreneur",
        "Industrialist",
        "Startup Founder",
      ],
      "Education": [
        "Teacher",
        "Professor",
        "Principal",
        "Research Scholar",
        "Student",
      ],
      "Social Sector": [
        "NGO Representative",
        "Trust Representative",
        "Society Representative",
        "Volunteer",
        "Social Worker",
      ],
      "Real Estate": [
        "Property Consultant",
        "Builder",
        "Developer",
        "Real Estate Agent",
      ],
      "Healthcare": [
        "Doctor",
        "Pharmacist",
      ],
      "Others": [
        "Employee",
        "Consultant",
        "Freelancer",
        "Farmer",
      ],
    },
  },
};

// Flatten all master professions into a single master array
export const ALL_MASTER_PROFESSIONS = Object.values(PROFESSIONAL_CLASSIFICATION).reduce((acc, level) => {
  Object.values(level.categories).forEach((list) => {
    acc.push(...list);
  });
  return acc;
}, []);

// Special Custom Trigger Options
export const CUSTOM_PROFESSION_TRIGGERS = [
  "Other",
  "Custom",
  "User Defined",
  "अन्य",
  "Other (Enter Manually)",
  "Other / Not Listed",
];

const CUSTOM_QUEUE_KEY = "icj_custom_professions_queue";
const GENERIC_MASTERS_QUEUE_KEY = "icj_custom_masters_queue";

export class ProfessionalMasterService {
  /**
   * Get all approval queue items for professions or generic master categories
   */
  static getApprovalQueue(category = null) {
    try {
      const raw = localStorage.getItem(GENERIC_MASTERS_QUEUE_KEY) || localStorage.getItem(CUSTOM_QUEUE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      if (category) {
        return queue.filter((item) => (item.category || "").toLowerCase() === category.toLowerCase());
      }
      return queue;
    } catch {
      return [];
    }
  }

  /**
   * Submit custom user-defined profession or master entry to Super Admin Approval Queue
   */
  static submitCustomProfession(customValue, submittedBy = "Member Registration", category = "Profession", metadata = {}) {
    return this.submitCustomMaster(category, customValue, submittedBy, metadata);
  }

  /**
   * Submit any custom master entry (Practice Area, Organisation, Court, State, District, City, Specialization, Category)
   */
  static submitCustomMaster(category = "Master", customValue, submittedBy = "User Entry", metadata = {}) {
    if (!customValue || !customValue.trim()) return null;
    const cleanValue = customValue.trim();

    // Prevent duplicate master entries under same category and state
    const queue = this.getApprovalQueue();
    const isDuplicate = queue.some(
      (q) =>
        (q.category || "").toLowerCase() === category.toLowerCase() &&
        (q.value || "").toLowerCase() === cleanValue.toLowerCase() &&
        (!metadata.state || (q.metadata?.state || "").toLowerCase() === (metadata.state || "").toLowerCase())
    );

    if (isDuplicate) {
      return { status: "DUPLICATE", message: `${category} entry already exists in Super Admin Queue.` };
    }

    const newEntry = {
      id: `CUST-MASTER-${category.toUpperCase()}-${Date.now()}`,
      category,
      value: cleanValue,
      submittedBy,
      submittedAt: new Date().toISOString(),
      status: "Pending Super Admin Approval",
      source: "CUSTOM/MANUAL",
      metadata: {
        source: "CUSTOM/MANUAL",
        ...metadata,
      },
    };

    queue.unshift(newEntry);
    try {
      localStorage.setItem(GENERIC_MASTERS_QUEUE_KEY, JSON.stringify(queue));
      localStorage.setItem(CUSTOM_QUEUE_KEY, JSON.stringify(queue));
    } catch {
      // safe fallback
    }

    return { status: "SUCCESS", entry: newEntry };
  }

  /**
   * Approve custom entry by Super Admin and promote to Master Registry
   */
  static approveMasterEntry(id) {
    const queue = this.getApprovalQueue();
    const updated = queue.map((item) => (item.id === id ? { ...item, status: "Approved & Promoted to Master" } : item));
    localStorage.setItem(GENERIC_MASTERS_QUEUE_KEY, JSON.stringify(updated));
    return updated;
  }
}

export default ProfessionalMasterService;
