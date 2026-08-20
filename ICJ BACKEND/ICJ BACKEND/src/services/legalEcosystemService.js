/**
 * LegalEcosystemService — Comprehensive AI Legal Management Backend for ICJ Enterprise Platform
 * Provides complete data management for Cases, Timelines, Hearings, Advocate Assignments,
 * Trust Approvals, Court Orders, Invoices, Billing, Revenue Sharing, OCR, and AI Legal Drafting.
 */

import { ENTERPRISE_SEED_USERS } from "../data/seedUsers.js";

const STORAGE_KEYS = {
  cases: "icj_legal_cases_v3",
  timelines: "icj_case_timelines_v3",
  hearings: "icj_court_hearings_v3",
  advocates: "icj_advocates_v3",
  orders: "icj_court_orders_v3",
  invoices: "icj_invoices_v3",
  trustApprovals: "icj_trust_approvals_v3",
  aiDrafts: "icj_ai_drafts_v3",
};

const getItem = (key, defaultVal = []) => {
  try {
    if (typeof localStorage === "undefined") return defaultVal;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setItem = (key, val) => {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Failed to store key ${key}`, err);
  }
};

// Initial Seed Data dynamically derived from 26 Master Users
const seedDefaultData = () => {
  // Extract real Advocates from 26 master users
  const seedAdvocates = ENTERPRISE_SEED_USERS
    .filter((u) => u.role === "advocate" || u.user_type === "advocate")
    .map((adv) => ({
      id: adv.id || adv.member_id,
      name: adv.fullName || adv.name,
      barId: adv.barRegistration || "UP/2026/9812",
      specialization: adv.practiceAreas || "Civil & Criminal Law",
      casesAssigned: 3,
      status: "Active",
      phone: adv.mobile,
      city: adv.city,
      state: adv.state,
    }));

  if (getItem(STORAGE_KEYS.advocates).length === 0) {
    setItem(STORAGE_KEYS.advocates, seedAdvocates);
  }

  // Extract real Litigants & create dynamic cases
  if (getItem(STORAGE_KEYS.cases).length === 0) {
    const defaultCases = [
      {
        id: "CASE-4YR-RESCUE-001",
        caseNumber: "UPHC-01-004812-2022",
        title: "Sh. Ramesh Kumar vs State of UP & Ors (Land Title & Criminal Dispute)",
        clientName: "Sh. Ramesh Kumar (ID: ICJ-2026-MEM-0015)",
        clientId: "ICJ-2026-MEM-0015",
        advocateName: "Adv. Vikramaditya Singh (Current ICJ Advocate)",
        advocateId: "ICJ-2026-MEM-0105",
        courtName: "District & Sessions Court, Lucknow",
        status: "In Hearing (Transferred to ICJ)",
        trustApprovalStatus: "Approved & Escrow Protected",
        nextHearing: "2026-08-22",
        filingDate: "2022-04-12",
        icjTransferDate: "2025-08-10",
        is4YearOldCase: true,
        summary: "Land title and criminal dispute transferred to ICJ for expedited hearing.",
        legalProvisions: ["BNSS 2023 Sec 482 (Anticipatory Bail)", "CPC Order 39 Rule 1&2 (Stay Order)", "BNS 2023 Sec 352"],
        feeAmount: 65000,
        paidAmount: 50000,
        advocateSharePaid: 35000,
        trustSharePaid: 15000,
        escrowBalance: 15000,
        hearingsStats: {
          totalInIcj: 12,
          advocateAttended: 5,
          clientSelfAttended: 7,
          travelFeeSaved: 24500,
        },
        vaultDocs: [
          { name: "FIR_Copy_Crime_412_2022.pdf", uploaded: "2025-08-10", drm: "Locked (OTP Protected)" },
          { name: "SaleDeed_Plot42_Lucknow.pdf", uploaded: "2025-08-12", drm: "Locked (OTP Protected)" },
          { name: "HighCourt_Interim_StayOrder_Jan2026.pdf", uploaded: "2026-01-14", drm: "Locked (OTP Protected)" },
        ],
      },
      {
        id: "CASE-2026-001",
        caseNumber: "WP/2026/1042",
        title: "Public Interest Litigation: Green Earth Trust vs Union of India",
        clientName: "Green Earth Trust (ID: ICJ-2026-MEM-0026)",
        clientId: "ICJ-2026-MEM-0026",
        advocateName: "Adv. Meenakshi Sundaram",
        advocateId: "26ICJ08AA0106",
        courtName: "High Court of Judicature",
        status: "In Hearing",
        trustApprovalStatus: "Approved",
        nextHearing: "2026-08-20",
        filingDate: "2026-01-15",
        summary: "PIL seeking injunctive relief against unauthorized deforestation in bio-reserves.",
        missingDocs: ["Environmental Impact Assessment Certificate 2025"],
        legalProvisions: ["Article 21 (Right to Clean Environment)", "Environment Protection Act Sec 3"],
        feeAmount: 45000,
        paidAmount: 30000,
      },
      {
        id: "CASE-2026-002",
        caseNumber: "CS/2026/0488",
        title: "Domestic Violence & Maintenance: Smt. Sunita Sharma vs State",
        clientName: "Smt. Sunita Sharma (ID: ICJ-2026-MEM-0016)",
        clientId: "ICJ-2026-MEM-0016",
        advocateName: "Adv. Rajeshwar Sharma",
        advocateId: "ICJ-2026-MEM-0107",
        courtName: "District Family Court, Noida",
        status: "Pending Approval",
        trustApprovalStatus: "Under Review",
        nextHearing: "2026-08-28",
        filingDate: "2026-03-10",
        summary: "Maintenance petition under Section 125 CrPC and Domestic Violence Protection.",
        missingDocs: ["Income Tax Returns Proof"],
        legalProvisions: ["Protection of Women from Domestic Violence Act Sec 12", "CrPC Sec 125"],
        feeAmount: 35000,
        paidAmount: 15000,
      },
    ];

    setItem(STORAGE_KEYS.cases, defaultCases);
  }

  if (getItem(STORAGE_KEYS.hearings).length === 0) {
    setItem(STORAGE_KEYS.hearings, [
      { id: "H-1", caseId: "CASE-2026-001", caseTitle: "PIL: Green Earth Trust", hearingDate: "2026-08-20", court: "High Court Bench 3", judge: "Hon'ble Justice A.K. Roy", purpose: "Final Arguments", status: "Scheduled" },
      { id: "H-2", caseId: "CASE-2026-002", caseTitle: "DV & Maintenance: Sunita Sharma", hearingDate: "2026-08-28", court: "Family Court 2", judge: "Hon'ble Judge V. Nair", purpose: "Admission & Interim Relief", status: "Scheduled" },
    ]);
  }
};

seedDefaultData();

export const LegalEcosystemService = {
  // Case CRUD
  getCases() {
    return getItem(STORAGE_KEYS.cases);
  },

  getCaseById(id) {
    const cases = this.getCases();
    return cases.find((c) => c.id === id || c.caseNumber === id);
  },

  createCase(caseData) {
    const cases = this.getCases();
    const id = `CASE-${new Date().getFullYear()}-${String(cases.length + 1).padStart(3, "0")}`;
    const newCase = {
      id,
      caseNumber: caseData.caseNumber || `PIL/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      title: caseData.title,
      clientName: caseData.clientName || "General Client",
      advocateName: caseData.advocateName || "Unassigned",
      advocateId: caseData.advocateId || "",
      courtName: caseData.courtName || "District Court",
      status: caseData.status || "Submitted",
      trustApprovalStatus: "Pending Approval",
      nextHearing: caseData.nextHearing || "",
      filingDate: new Date().toISOString().slice(0, 10),
      summary: caseData.summary || "Case filed through ICJ Enterprise Legal Ecosystem.",
      missingDocs: caseData.missingDocs || [],
      legalProvisions: caseData.legalProvisions || ["Constitution of India", "Civil Procedure Code"],
      feeAmount: Number(caseData.feeAmount || 25000),
      paidAmount: Number(caseData.paidAmount || 0),
      createdAt: new Date().toISOString(),
    };

    const updated = [newCase, ...cases];
    setItem(STORAGE_KEYS.cases, updated);
    return newCase;
  },

  updateCaseStatus(id, newStatus, trustStatus) {
    const cases = this.getCases();
    const updated = cases.map((c) => {
      if (c.id === id || c.caseNumber === id) {
        return {
          ...c,
          status: newStatus || c.status,
          trustApprovalStatus: trustStatus || c.trustApprovalStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    setItem(STORAGE_KEYS.cases, updated);
  },

  getAdvocates() {
    return getItem(STORAGE_KEYS.advocates);
  },

  assignAdvocate(caseId, advocateId) {
    const advocates = this.getAdvocates();
    const advocate = advocates.find((a) => a.id === advocateId);
    if (!advocate) return;

    const cases = this.getCases();
    const updatedCases = cases.map((c) => {
      if (c.id === caseId) {
        return { ...c, advocateId: advocate.id, advocateName: advocate.name };
      }
      return c;
    });
    setItem(STORAGE_KEYS.cases, updatedCases);
  },

  getCaseTimeline(caseId) {
    const timelines = getItem(STORAGE_KEYS.timelines, {});
    const list = timelines[caseId] || [];
    return list.sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  getHearings() {
    return getItem(STORAGE_KEYS.hearings);
  },

  getInvoices() {
    const cases = this.getCases();
    return cases.map((c) => {
      const remaining = Math.max(0, c.feeAmount - c.paidAmount);
      const advocateShare = Math.round(c.feeAmount * 0.7);
      const trustShare = Math.round(c.feeAmount * 0.3);
      return {
        invoiceNo: `INV-${c.id}`,
        caseId: c.id,
        caseTitle: c.title,
        clientName: c.clientName,
        advocateName: c.advocateName,
        feeAmount: c.feeAmount,
        paidAmount: c.paidAmount,
        remainingAmount: remaining,
        advocateShare,
        trustShare,
        status: remaining === 0 ? "Paid" : c.paidAmount > 0 ? "Partial" : "Unpaid",
      };
    });
  },
};

export default LegalEcosystemService;
