/**
 * ICJ ENTERPRISE PLATFORM — ORGANISATION & LEGAL ENTITY TYPE MASTER
 * Multi-Jurisdictional, Category-Aware Legal Form Classification Engine.
 */

export const NAME_PREFIXES = [
  "Mr.",
  "Ms.",
  "Mrs.",
  "Dr.",
  "Prof.",
  "Shri",
  "Smt.",
  "Other",
];

export const LEGAL_PERSONALITIES = [
  "Natural Person",
  "Juristic / Artificial Person",
  "Corporate Legal Person",
  "Statutory Legal Person",
  "Unincorporated Organisation",
  "Other / Not Applicable",
];

export const FUNCTIONAL_CLASSIFICATIONS = [
  "Advocate",
  "Chartered Accountant",
  "Company Secretary",
  "Cost Accountant",
  "Doctor",
  "Engineer",
  "Architect",
  "Consultant",
  "Legal Services",
  "Educational Institution",
  "Research Institution",
  "Social Welfare/NGO",
  "Business/Commercial",
  "Other",
];

export const JURISDICTIONS = [
  "India",
  "United States",
  "United Kingdom",
  "International / Foreign Jurisdiction",
];

export const ENTITY_MASTER = {
  India: {
    "Individual / Family": [
      "Individual",
      "Sole Proprietor",
      "Sole Proprietorship",
      "Hindu Undivided Family (HUF)",
      "Family Business",
      "Joint Family Business",
    ],
    "Partnership": [
      "Partnership Firm",
      "Registered Partnership Firm",
      "Unregistered Partnership Firm",
      "Partnership at Will",
      "Particular Partnership",
      "Limited Liability Partnership (LLP)",
    ],
    "Company / Corporate": [
      "Private Limited Company",
      "Public Limited Company",
      "One Person Company (OPC)",
      "Section 8 Company",
      "Company Limited by Shares",
      "Company Limited by Guarantee",
      "Unlimited Company",
      "Government Company",
      "Producer Company",
      "Nidhi Company",
      "Holding Company",
      "Subsidiary Company",
      "Associate Company",
      "Listed Company",
      "Unlisted Company",
      "Foreign Company",
      "Foreign Subsidiary",
    ],
    "Trust": [
      "Private Trust",
      "Public Trust",
      "Public Charitable Trust",
      "Charitable Trust",
      "Religious Trust",
      "Charitable and Religious Trust",
      "Family Trust",
      "Educational Trust",
      "Testamentary Trust",
      "Other Trust",
    ],
    "Society / Association / NGO": [
      "Registered Society",
      "Society",
      "Association",
      "Association of Persons (AOP)",
      "Body of Individuals (BOI)",
      "NGO",
      "Non-Profit Organisation (NPO)",
      "Charitable Association",
      "Religious Association",
      "Educational Association",
      "Professional Association",
      "Welfare Association",
      "Resident Welfare Association (RWA)",
      "Trade Association",
      "Industry Association",
      "Bar Association",
      "Sports Association",
      "Cultural Association",
    ],
    "Cooperative": [
      "Cooperative Society",
      "Multi-State Cooperative Society",
      "Cooperative Bank",
      "Cooperative Federation",
      "Credit Cooperative Society",
      "Housing Cooperative Society",
      "Consumer Cooperative Society",
      "Agricultural Cooperative Society",
      "Labour Cooperative Society",
      "Producer Cooperative",
      "Cooperative Union/Federation",
    ],
    "Government / Public / Statutory": [
      "Central Government Department",
      "State Government Department",
      "Local Authority",
      "Municipal Corporation",
      "Municipality",
      "Nagar Panchayat",
      "Panchayati Raj Institution",
      "Statutory Corporation",
      "Statutory Authority",
      "Government Authority",
      "Regulatory Authority",
      "Public Sector Undertaking (PSU)",
      "Government Corporation",
      "Autonomous Body",
      "Constitutional Body",
      "Commission",
      "Board",
      "Tribunal",
      "Development Authority",
      "Public Institution",
    ],
    "Professional": [
      "Law Firm",
      "Advocates' Association",
      "Chartered Accountants Firm",
      "Company Secretaries Firm",
      "Cost Accountants Firm",
      "Medical Practice",
      "Dental Practice",
      "Architecture Firm",
      "Engineering Consultancy",
      "Professional Partnership",
      "Professional LLP",
      "Consultancy Firm",
    ],
    "Other": [
      "Foundation",
      "International Organisation",
      "Foreign Entity",
      "Other Legal/Organisational Form",
    ],
  },

  "United States": {
    "Business / Corporate": [
      "Sole Proprietorship",
      "General Partnership",
      "Limited Partnership (LP)",
      "Limited Liability Partnership (LLP)",
      "Limited Liability Company (LLC)",
      "Professional LLC (PLLC)",
      "Corporation",
      "C Corporation",
      "S Corporation",
      "Nonprofit Corporation",
      "Benefit Corporation",
      "Professional Corporation",
      "Public Benefit Corporation",
      "Cooperative",
    ],
    "Trust & Non-Corporate": [
      "Trust",
      "Foundation",
      "Association",
    ],
  },

  "United Kingdom": {
    "Business / Corporate": [
      "Sole Trader",
      "General Partnership",
      "Limited Partnership (LP)",
      "Limited Liability Partnership (LLP)",
      "Private Limited Company (Ltd)",
      "Public Limited Company (PLC)",
      "Company Limited by Shares",
      "Company Limited by Guarantee",
      "Community Interest Company (CIC)",
      "Charitable Incorporated Organisation (CIO)",
      "Charity",
      "Cooperative",
      "Overseas Company",
    ],
  },

  "International / Foreign Jurisdiction": {
    "International / Foreign Forms": [
      "GmbH",
      "AG",
      "SARL / Sàrl",
      "SAS",
      "SA",
      "BV",
      "NV",
      "AB",
      "AS",
      "ApS",
      "A/S",
      "Oy",
      "Kabushiki Kaisha (K.K.)",
      "Godo Kaisha (GK)",
      "Pty Ltd",
      "Inc.",
      "Corp.",
      "LLC",
      "LP",
      "LLP",
      "Foundation",
      "Association",
      "Cooperative",
      "Nonprofit Corporation",
      "Charity",
      "International Organisation",
      "Intergovernmental Organisation",
      "Foreign Government Entity",
      "Sovereign Entity",
      "Statutory Corporation",
      "Public Authority",
    ],
  },
};

/**
 * Helper to get available categories for a given jurisdiction
 */
export const getCategoriesForJurisdiction = (jurisdiction = "India") => {
  const data = ENTITY_MASTER[jurisdiction] || ENTITY_MASTER["India"];
  return Object.keys(data);
};

/**
 * Helper to get available entity types for a jurisdiction and category
 */
export const getEntityTypes = (jurisdiction = "India", category = "Company / Corporate") => {
  const jurData = ENTITY_MASTER[jurisdiction] || ENTITY_MASTER["India"];
  if (!category) {
    return Object.values(jurData).flat();
  }
  return jurData[category] || Object.values(jurData).flat();
};

/**
 * Automatic Legal Personality mapping rule based on Entity Category and Entity Type
 */
export const getLegalPersonality = (regType, category, entityType) => {
  if (regType === "Individual" || (category || "").toLowerCase().includes("individual")) {
    return "Natural Person";
  }
  const typeStr = (entityType || "").toLowerCase();
  const catStr = (category || "").toLowerCase();

  if (typeStr.includes("company") || typeStr.includes("corporation") || typeStr.includes("inc") || typeStr.includes("llc") || typeStr.includes("llp") || typeStr.includes("ltd") || typeStr.includes("plc") || typeStr.includes("gmbh") || typeStr.includes("ag")) {
    return "Corporate Legal Person";
  }
  if (catStr.includes("government") || typeStr.includes("statutory") || typeStr.includes("authority") || typeStr.includes("board") || typeStr.includes("commission") || typeStr.includes("tribunal")) {
    return "Statutory Legal Person";
  }
  if (catStr.includes("trust") || catStr.includes("society") || typeStr.includes("association") || typeStr.includes("partnership") || typeStr.includes("firm")) {
    return "Juristic / Artificial Person";
  }
  if (typeStr.includes("unregistered") || typeStr.includes("aop") || typeStr.includes("boi")) {
    return "Unincorporated Organisation";
  }
  return "Juristic / Artificial Person";
};

export default ENTITY_MASTER;
