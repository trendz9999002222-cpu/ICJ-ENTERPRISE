/**
 * ICJ ENTERPRISE PLATFORM
 * Master Data Management (MDM) Service for Category, Court Forum, and Legal Specialty
 */

const CATEGORIES_KEY = "icj_master_categories";
const FORUMS_KEY = "icj_master_forums";
const SPECIALTIES_KEY = "icj_master_specialties";
const SUGGESTIONS_KEY = "icj_master_suggestions";

const DEFAULT_CATEGORIES = ["General", "OBC", "SC", "ST", "Minority"];

const DEFAULT_FORUMS = [
  "Supreme Court of India", "High Court", "District & Sessions Court", "District Court",
  "Sessions Court", "Additional District Court", "Civil Court", "Senior Civil Judge Court",
  "Civil Judge Court", "Magistrate Court", "Chief Judicial Magistrate Court",
  "Metropolitan Magistrate Court", "Family Court", "Commercial Court", "Special Court",
  "Fast Track Court", "Juvenile Justice Board", "Court of Small Causes", "SDM Court",
  "Tehsil / Tehsildar Court", "Revenue Court", "Additional Collector Court",
  "Collector Court", "Divisional Commissioner", "Executive Magistrate", "NCLT",
  "NCLAT", "DRT", "DRAT", "CAT", "NGT", "ITAT", "CESTAT", "AFT", "RERA",
  "District Consumer Commission", "State Consumer Commission", "National Consumer Commission",
  "Labour Court", "Industrial Tribunal", "CGIT"
];

const DEFAULT_SPECIALTIES = [
  // CRIMINAL
  { name: "Criminal Law", category: "Criminal" },
  { name: "Criminal Litigation", category: "Criminal" },
  { name: "Criminal Defence", category: "Criminal" },
  { name: "Bail Matters", category: "Criminal" },
  { name: "Anticipatory Bail", category: "Criminal" },
  { name: "Regular Bail", category: "Criminal" },
  { name: "FIR Matters", category: "Criminal" },
  { name: "FIR Quashing", category: "Criminal" },
  { name: "Criminal Revision", category: "Criminal" },
  { name: "Criminal Appeal", category: "Criminal" },
  { name: "Criminal Writ", category: "Criminal" },
  { name: "Trial Matters", category: "Criminal" },
  { name: "POCSO", category: "Criminal" },
  { name: "NDPS", category: "Criminal" },
  { name: "Cyber Crime", category: "Criminal" },
  { name: "Economic Offences", category: "Criminal" },
  { name: "White Collar Crime", category: "Criminal" },
  { name: "Cheque Bounce / NI Act", category: "Criminal" },
  { name: "Domestic Violence", category: "Criminal" },
  { name: "Juvenile Justice", category: "Criminal" },
  // CIVIL
  { name: "Civil Litigation", category: "Civil" },
  { name: "Civil Suits", category: "Civil" },
  { name: "Civil Appeal", category: "Civil" },
  { name: "Civil Revision", category: "Civil" },
  { name: "Civil Writ", category: "Civil" },
  { name: "Injunction", category: "Civil" },
  { name: "Declaration", category: "Civil" },
  { name: "Recovery", category: "Civil" },
  { name: "Specific Performance", category: "Civil" },
  { name: "Contract Disputes", category: "Civil" },
  { name: "Execution Proceedings", category: "Civil" },
  // PROPERTY / REVENUE
  { name: "Property Disputes", category: "Property / Revenue" },
  { name: "Property Title", category: "Property / Revenue" },
  { name: "Ownership", category: "Property / Revenue" },
  { name: "Possession", category: "Property / Revenue" },
  { name: "Partition", category: "Property / Revenue" },
  { name: "Succession", category: "Property / Revenue" },
  { name: "Mutation", category: "Property / Revenue" },
  { name: "Khasra / Khatauni", category: "Property / Revenue" },
  { name: "Revenue Litigation", category: "Property / Revenue" },
  { name: "Land Acquisition", category: "Property / Revenue" },
  { name: "Encroachment", category: "Property / Revenue" },
  { name: "Tenancy / Rent", category: "Property / Revenue" },
  { name: "Lease & Licensing", category: "Property / Revenue" },
  { name: "Real Estate", category: "Property / Revenue" },
  { name: "RERA", category: "Property / Revenue" },
  { name: "Construction Disputes", category: "Property / Revenue" },
  // FAMILY
  { name: "Divorce", category: "Family" },
  { name: "Matrimonial Disputes", category: "Family" },
  { name: "Maintenance", category: "Family" },
  { name: "Child Custody", category: "Family" },
  { name: "Guardianship", category: "Family" },
  { name: "Adoption", category: "Family" },
  { name: "Wills", category: "Family" },
  { name: "Probate", category: "Family" },
  { name: "Inheritance", category: "Family" },
  // CORPORATE / COMMERCIAL
  { name: "Commercial Litigation", category: "Commercial / Corporate" },
  { name: "Corporate Law", category: "Commercial / Corporate" },
  { name: "Company Law", category: "Commercial / Corporate" },
  { name: "Commercial Contracts", category: "Commercial / Corporate" },
  { name: "Corporate Compliance", category: "Commercial / Corporate" },
  { name: "M&A", category: "Commercial / Corporate" },
  { name: "Joint Ventures", category: "Commercial / Corporate" },
  { name: "Startup / Business Law", category: "Commercial / Corporate" },
  { name: "Shareholder Disputes", category: "Commercial / Corporate" },
  { name: "Corporate Governance", category: "Commercial / Corporate" },
  // BANKING / FINANCE
  { name: "Banking Litigation", category: "Banking / Finance" },
  { name: "Loan Recovery", category: "Banking / Finance" },
  { name: "Debt Recovery", category: "Banking / Finance" },
  { name: "SARFAESI", category: "Banking / Finance" },
  { name: "DRT Matters", category: "Banking / Finance" },
  { name: "DRAT Matters", category: "Banking / Finance" },
  { name: "Financial Recovery", category: "Banking / Finance" },
  { name: "Insolvency", category: "Banking / Finance" },
  { name: "IBC", category: "Banking / Finance" },
  { name: "Asset Reconstruction", category: "Banking / Finance" },
  // TAX
  { name: "Income Tax", category: "Tax" },
  { name: "GST", category: "Tax" },
  { name: "GST Litigation", category: "Tax" },
  { name: "Customs", category: "Tax" },
  { name: "Excise", category: "Tax" },
  { name: "Tax Appeals", category: "Tax" },
  { name: "ITAT", category: "Tax" },
  { name: "Tax Advisory", category: "Tax" },
  // ADR
  { name: "Arbitration", category: "ADR" },
  { name: "Mediation", category: "ADR" },
  { name: "Conciliation", category: "ADR" },
  { name: "Commercial Arbitration", category: "ADR" },
  { name: "Domestic Arbitration", category: "ADR" },
  { name: "International Arbitration", category: "ADR" },
  { name: "Arbitration Enforcement", category: "ADR" },
  // PUBLIC / CONSTITUTIONAL
  { name: "Constitutional Law", category: "Public / Constitutional" },
  { name: "Fundamental Rights", category: "Public / Constitutional" },
  { name: "Writ Jurisdiction", category: "Public / Constitutional" },
  { name: "Administrative Law", category: "Public / Constitutional" },
  { name: "Service Matters", category: "Public / Constitutional" },
  { name: "Government Litigation", category: "Public / Constitutional" },
  { name: "PIL", category: "Public / Constitutional" },
  { name: "RTI Matters", category: "Public / Constitutional" },
  // LABOUR
  { name: "Labour Law", category: "Labour" },
  { name: "Employment Disputes", category: "Labour" },
  { name: "Industrial Disputes", category: "Labour" },
  { name: "Service Law", category: "Labour" },
  { name: "Employment Contracts", category: "Labour" },
  { name: "Disciplinary Proceedings", category: "Labour" },
  // CONSUMER
  { name: "Consumer Disputes", category: "Consumer" },
  { name: "Consumer Protection", category: "Consumer" },
  { name: "Product Liability", category: "Consumer" },
  { name: "Service Deficiency", category: "Consumer" },
  { name: "Consumer Commission", category: "Consumer" },
  // SPECIALIZED
  { name: "Cyber Law", category: "Specialized" },
  { name: "Intellectual Property", category: "Specialized" },
  { name: "Trademark", category: "Specialized" },
  { name: "Copyright", category: "Specialized" },
  { name: "Patent", category: "Specialized" },
  { name: "Environmental Law", category: "Specialized" },
  { name: "NGT", category: "Specialized" },
  { name: "Competition Law", category: "Specialized" },
  { name: "Media & Entertainment", category: "Specialized" },
  { name: "Education Law", category: "Specialized" },
  { name: "Medical / Healthcare Law", category: "Specialized" },
  { name: "Human Rights", category: "Specialized" },
  { name: "Immigration", category: "Specialized" },
  { name: "International Law", category: "Specialized" },
  { name: "Data Protection / Privacy", category: "Specialized" },
  { name: "Technology / IT Law", category: "Specialized" }
];

function getStore(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function saveStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Simple Levenshtein distance implementation for normalization check
function getSimilarity(s1, s2) {
  let longer = s1.trim().toLowerCase();
  let shorter = s2.trim().toLowerCase();
  if (longer.length < shorter.length) {
    let temp = longer;
    longer = shorter;
    shorter = temp;
  }
  let longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  
  const editDistance = (a, b) => {
    let costs = new Array();
    for (let i = 0; i <= a.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= b.length; j++) {
        if (i === 0) costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (a.charAt(i - 1) !== b.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[b.length] = lastValue;
    }
    return costs[b.length];
  };

  return (longerLength - editDistance(longer, shorter)) / longerLength;
}

export const MasterDataService = {
  getCategories() {
    return getStore(CATEGORIES_KEY, DEFAULT_CATEGORIES);
  },

  getForums() {
    const stored = getStore(FORUMS_KEY, []);
    if (stored.length === 0) {
      const initialized = DEFAULT_FORUMS.map((f, idx) => ({ id: `FORUM_${idx + 1}`, name: f, aliases: [] }));
      saveStore(FORUMS_KEY, initialized);
      return initialized;
    }
    return stored;
  },

  getSpecialties() {
    const stored = getStore(SPECIALTIES_KEY, []);
    if (stored.length === 0) {
      const initialized = DEFAULT_SPECIALTIES.map((s, idx) => ({ id: `SPEC_${idx + 1}`, name: s.name, category: s.category, aliases: [] }));
      saveStore(SPECIALTIES_KEY, initialized);
      return initialized;
    }
    return stored;
  },

  getSuggestions() {
    return getStore(SUGGESTIONS_KEY, []);
  },

  suggestNewEntry(type, name, parentCategory = "") {
    const suggestions = this.getSuggestions();
    const cleanName = String(name).trim();

    // Normalization check: Check for duplicates/similar names in suggestions or master data
    let existingMatch = null;
    if (type === "forum") {
      existingMatch = this.getForums().find(f => f.name.toLowerCase() === cleanName.toLowerCase() || f.aliases.includes(cleanName.toLowerCase()));
    } else if (type === "specialty") {
      existingMatch = this.getSpecialties().find(s => s.name.toLowerCase() === cleanName.toLowerCase() || s.aliases.includes(cleanName.toLowerCase()));
    }

    if (existingMatch) {
      return { success: false, message: `Similar entity already exists: "${existingMatch.name}".` };
    }

    // Similarity check in pending suggestions
    const duplicatesInSuggestions = suggestions.find(s => s.type === type && getSimilarity(s.name, cleanName) > 0.85);
    if (duplicatesInSuggestions) {
      return { success: false, message: `A similar pending suggestion already exists: "${duplicatesInSuggestions.name}".` };
    }

    const payload = {
      id: `SUGG_${Date.now()}`,
      type,
      name: cleanName,
      parentCategory,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    suggestions.push(payload);
    saveStore(SUGGESTIONS_KEY, suggestions);
    return { success: true, suggestion: payload };
  },

  approveSuggestion(id) {
    const suggestions = this.getSuggestions();
    const idx = suggestions.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, message: "Suggestion not found" };

    const sugg = suggestions[idx];
    sugg.status = "Approved";

    if (sugg.type === "forum") {
      const forums = this.getForums();
      forums.push({ id: `FORUM_${Date.now()}`, name: sugg.name, aliases: [] });
      saveStore(FORUMS_KEY, forums);
    } else if (sugg.type === "specialty") {
      const specialties = this.getSpecialties();
      specialties.push({ id: `SPEC_${Date.now()}`, name: sugg.name, category: sugg.parentCategory || "Specialized", aliases: [] });
      saveStore(SPECIALTIES_KEY, specialties);
    }

    suggestions.splice(idx, 1);
    saveStore(SUGGESTIONS_KEY, suggestions);
    return { success: true };
  },

  rejectSuggestion(id) {
    const suggestions = this.getSuggestions();
    const filtered = suggestions.filter(s => s.id !== id);
    saveStore(SUGGESTIONS_KEY, filtered);
    return { success: true };
  },

  mergeAlias(type, targetId, aliasName) {
    const cleanAlias = String(aliasName).trim();
    if (type === "forum") {
      const forums = this.getForums();
      const target = forums.find(f => f.id === targetId);
      if (!target) return { success: false, message: "Target forum not found" };
      if (!target.aliases.includes(cleanAlias)) {
        target.aliases.push(cleanAlias);
      }
      saveStore(FORUMS_KEY, forums);
      // Resolve existing members having this alias automatically
      this.resolveMemberAliases("forums", cleanAlias, target.name);
    } else if (type === "specialty") {
      const specialties = this.getSpecialties();
      const target = specialties.find(s => s.id === targetId);
      if (!target) return { success: false, message: "Target specialty not found" };
      if (!target.aliases.includes(cleanAlias)) {
        target.aliases.push(cleanAlias);
      }
      saveStore(SPECIALTIES_KEY, specialties);
      this.resolveMemberAliases("specialties", cleanAlias, target.name);
    }
    return { success: true };
  },

  resolveMemberAliases(field, aliasValue, canonicalValue) {
    try {
      const members = JSON.parse(localStorage.getItem("icj_members") || "[]");
      const updated = members.map(m => {
        if (field === "forums" && Array.isArray(m.forums)) {
          const nextForums = m.forums.map(f => String(f).toLowerCase() === aliasValue.toLowerCase() ? canonicalValue : f);
          return { ...m, forums: nextForums };
        }
        if (field === "specialties" && Array.isArray(m.additionalSpecialties)) {
          const nextSpecs = m.additionalSpecialties.map(s => String(s).toLowerCase() === aliasValue.toLowerCase() ? canonicalValue : s);
          return { ...m, additionalSpecialties: nextSpecs };
        }
        return m;
      });
      localStorage.setItem("icj_members", JSON.stringify(updated));
      localStorage.setItem("icj_enterprise_users", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to auto-resolve aliases for members:", e);
    }
  }
};

export default MasterDataService;
