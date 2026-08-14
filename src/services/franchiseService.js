/**
 * FranchiseService — ICJ Enterprise Platform
 * Master Franchisee & Branch Office Hierarchy Management Engine
 * Hierarchy: National HQ ➔ State Chapter ➔ District Franchisee / Branch ➔ Local Desk
 * Handles District Geo-Routing, Franchisee Empanelment, and 10% Commission Ledgers.
 */

const FRANCHISEES_KEY = "icj_enterprise_franchisees";
const FRANCHISEE_LEDGER_KEY = "icj_enterprise_franchisee_ledgers";

const DEFAULT_FRANCHISEES = [
  {
    id: "FRAN-LKO-001",
    code: "FRAN-LKO",
    name: "Lucknow Central District Franchisee & Branch",
    state: "Uttar Pradesh",
    district: "Lucknow",
    city: "Lucknow",
    pincodes: ["226001", "226002", "226010", "226012", "226016", "226020"],
    headName: "Sh. Alok Nath Verma (Branch Director)",
    email: "lucknow.branch@icj.org",
    phone: "+91 94150 11223",
    status: "Active",
    walletBalance: 25000,
    totalCommissionEarned: 145000,
    activeCasesAssigned: 42,
  },
  {
    id: "FRAN-DEL-001",
    code: "FRAN-DEL",
    name: "Delhi National Capital Region Branch",
    state: "Delhi",
    district: "New Delhi",
    city: "New Delhi",
    pincodes: ["110001", "110002", "110003", "110011", "110020"],
    headName: "Smt. Sunita Rao (Regional Director)",
    email: "delhi.branch@icj.org",
    phone: "+91 98110 33445",
    status: "Active",
    walletBalance: 48000,
    totalCommissionEarned: 290000,
    activeCasesAssigned: 88,
  },
  {
    id: "FRAN-MUM-001",
    code: "FRAN-MUM",
    name: "Mumbai Suburban District Branch",
    state: "Maharashtra",
    district: "Mumbai",
    city: "Mumbai",
    pincodes: ["400001", "400050", "400051", "400099"],
    headName: "Sh. Rajesh Kulkarni (Managing Director)",
    email: "mumbai.branch@icj.org",
    phone: "+91 98200 55667",
    status: "Active",
    walletBalance: 62000,
    totalCommissionEarned: 410000,
    activeCasesAssigned: 114,
  },
];

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
    console.error("FranchiseService setStore error", e);
  }
};

export const FranchiseService = {
  /**
   * Get all registered District Franchisees & Branch Offices
   */
  getFranchisees() {
    const list = getStore(FRANCHISEES_KEY, []);
    if (list.length === 0) {
      setStore(FRANCHISEES_KEY, DEFAULT_FRANCHISEES);
      return DEFAULT_FRANCHISEES;
    }
    return list;
  },

  /**
   * Auto-assign District Franchisee based on State, District, or Pincode
   */
  findFranchiseeForLocation({ state = "", district = "", pincode = "" }) {
    const list = this.getFranchisees();
    const cleanDist = String(district).trim().toLowerCase();
    const cleanState = String(state).trim().toLowerCase();
    const cleanPin = String(pincode).trim();

    // 1. Pincode exact match
    if (cleanPin) {
      const pinMatch = list.find((f) => f.pincodes && f.pincodes.includes(cleanPin));
      if (pinMatch) return pinMatch;
    }

    // 2. District match
    if (cleanDist) {
      const distMatch = list.find((f) => String(f.district).toLowerCase() === cleanDist);
      if (distMatch) return distMatch;
    }

    // 3. State match
    if (cleanState) {
      const stateMatch = list.find((f) => String(f.state).toLowerCase() === cleanState);
      if (stateMatch) return stateMatch;
    }

    // Default fallback to National HQ Franchisee
    return list[0] || DEFAULT_FRANCHISEES[0];
  },

  /**
   * Register a new Franchisee / Branch Office
   */
  registerFranchisee(payload = {}) {
    const list = this.getFranchisees();
    const newId = `FRAN-${(payload.district || "DIST").substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newFranchisee = {
      id: newId,
      code: `FRAN-${(payload.district || "DIST").substring(0, 3).toUpperCase()}`,
      name: payload.name || `${payload.district || "District"} Branch Office`,
      state: payload.state || "Uttar Pradesh",
      district: payload.district || "General",
      city: payload.city || payload.district || "Central",
      pincodes: payload.pincodes || [],
      headName: payload.headName || payload.contactPerson || "Branch Manager",
      email: payload.email || `branch.${newId.toLowerCase()}@icj.org`,
      phone: payload.phone || "+91 90000 00000",
      status: "Active",
      walletBalance: 0,
      totalCommissionEarned: 0,
      activeCasesAssigned: 0,
      createdAt: new Date().toISOString(),
    };

    list.unshift(newFranchisee);
    setStore(FRANCHISEES_KEY, list);
    return newFranchisee;
  },

  /**
   * Credit 10% Commission to Franchisee Ledger on Payment Settlement
   */
  creditCommission({ franchiseeId, amount, caseId, invoiceNo, description }) {
    const list = this.getFranchisees();
    const idx = list.findIndex((f) => f.id === franchiseeId || f.code === franchiseeId);

    if (idx !== -1) {
      const commAmount = Math.round(amount);
      list[idx].walletBalance = (list[idx].walletBalance || 0) + commAmount;
      list[idx].totalCommissionEarned = (list[idx].totalCommissionEarned || 0) + commAmount;
      setStore(FRANCHISEES_KEY, list);

      // Log transaction entry
      const ledgers = getStore(FRANCHISEE_LEDGER_KEY, []);
      ledgers.unshift({
        id: `COMM-${Date.now()}`,
        franchiseeId: list[idx].id,
        franchiseeName: list[idx].name,
        caseId,
        invoiceNo,
        amount: commAmount,
        type: "COMMISSION_CREDIT",
        description: description || `10% Franchisee Commission for Case ${caseId}`,
        timestamp: new Date().toISOString(),
      });
      setStore(FRANCHISEE_LEDGER_KEY, ledgers);

      return { success: true, newBalance: list[idx].walletBalance };
    }
    return { success: false, message: "Franchisee not found" };
  },

  /**
   * Get Franchisee Commission Ledger History
   */
  getCommissionLedger(franchiseeId = null) {
    const ledgers = getStore(FRANCHISEE_LEDGER_KEY, []);
    if (franchiseeId) {
      return ledgers.filter((l) => l.franchiseeId === franchiseeId);
    }
    return ledgers;
  }
};

export default FranchiseService;
