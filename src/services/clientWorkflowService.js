/**
 * ClientWorkflowService — ICJ Enterprise Platform
 * Handles Client Problem Submission, Admin Alert Notifications,
 * District Franchisee Geo-Routing, Advocate Assignment Queue, Free Credit Grants, and Real-time Status Sync.
 */

import FranchiseService from "./franchiseService.js";
import TokenLedgerService from "./tokenLedgerService.js";
import ActivityService from "./activityService.js";

const PENDING_CLIENT_CASES_KEY = "icj_pending_client_cases";
const LEGAL_CASES_KEY = "icj_legal_cases_v2";

const getPendingCases = () => {
  try {
    const raw = localStorage.getItem(PENDING_CLIENT_CASES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const savePendingCases = (cases) => {
  try {
    localStorage.setItem(PENDING_CLIENT_CASES_KEY, JSON.stringify(cases));
  } catch (e) {
    console.error("Failed to save pending cases", e);
  }
};

const getLegalCases = () => {
  try {
    const raw = localStorage.getItem(LEGAL_CASES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLegalCases = (cases) => {
  try {
    localStorage.setItem(LEGAL_CASES_KEY, JSON.stringify(cases));
  } catch (e) {
    console.error("Failed to save legal cases", e);
  }
};

export const ClientWorkflowService = {
  /**
   * 1. Client submits a new problem (from ClientPortal or Onboarding)
   */
  submitProblemRequest({ clientId, clientName, problemText, caseCategory, desiredOutcome, voiceNoteSummary, state, district, pincode }) {
    const requestId = `REQ-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Auto-match District Franchisee
    const franchisee = FranchiseService.findFranchiseeForLocation({ state, district, pincode });

    const newRequest = {
      requestId,
      clientId: clientId || "CL-GUEST",
      clientName: clientName || "Litigant",
      problemText: (problemText || voiceNoteSummary || "").trim(),
      caseCategory: caseCategory || "general",
      desiredOutcome: desiredOutcome || "Legal Consultation & Advocate Assignment",
      timestamp,
      status: "PENDING_ADMIN_REVIEW",
      franchiseeId: franchisee.id,
      franchiseeName: franchisee.name,
      district: district || franchisee.district,
      state: state || franchisee.state,
      assignedAdvocateId: null,
      assignedAdvocateName: null,
      assignedAt: null,
      grantedCredit: 0,
      adminNotes: `Submitted. Auto-assigned to ${franchisee.name}. Awaiting Admin review and Advocate appointment.`,
    };

    const cases = getPendingCases();
    cases.unshift(newRequest);
    savePendingCases(cases);

    // Auto-generate Legal Case Record in icj_legal_cases_v2
    const legalCases = getLegalCases();
    const caseNumber = `CASE-2026-${String(legalCases.length + 101).padStart(3, "0")}`;
    const newLegalCase = {
      id: `CASE-${Date.now()}`,
      caseNumber,
      title: `${caseCategory || "General"} Litigation Matter: ${clientName || "Litigant"}`,
      clientName: clientName || "Litigant",
      member_id: clientId || "CL-GUEST",
      advocateName: "Unassigned",
      advocateId: null,
      franchiseeId: franchisee.id,
      franchiseeName: franchisee.name,
      courtName: "District & Sessions Court",
      status: "Intake Submitted",
      trustApprovalStatus: "Pending Trust Review",
      nextHearing: "Awaiting Schedule",
      feeAmount: 5000,
      paidAmount: 0,
      summary: (problemText || voiceNoteSummary || "").trim(),
      legalProvisions: ["IPC Section 420", "Civil Procedure Code Order 39"],
      created_at: timestamp,
      updated_at: timestamp,
    };

    legalCases.unshift(newLegalCase);
    saveLegalCases(legalCases);

    ActivityService.create({
      title: `New Case Intake Submitted: ${caseNumber}`,
      type: "legal",
      details: `Client ${clientName} submitted intake auto-routed to ${franchisee.name}`,
    });

    return { request: newRequest, legalCase: newLegalCase };
  },

  /**
   * 2. Get all pending requests requiring Admin Action
   */
  getPendingCasesForAdmin() {
    const cases = getPendingCases();
    return cases.filter((c) => c.status === "PENDING_ADMIN_REVIEW");
  },

  /**
   * 3. Get all client requests (history & pending)
   */
  getAllClientRequests(clientId = null) {
    const cases = getPendingCases();
    if (clientId) {
      return cases.filter((c) => c.clientId === clientId);
    }
    return cases;
  },

  /**
   * 4. Admin Appoints Advocate to a Client Case (Triggers 50 ICJ Token Reward & Case Sync)
   */
  appointAdvocate({ requestId, advocateId, advocateName, adminUsername }) {
    const cases = getPendingCases();
    let targetClientId = null;
    let targetClientName = null;

    const updated = cases.map((c) => {
      if (c.requestId === requestId) {
        targetClientId = c.clientId;
        targetClientName = c.clientName;
        return {
          ...c,
          status: "ADVOCATE_ASSIGNED",
          assignedAdvocateId: advocateId,
          assignedAdvocateName: advocateName,
          assignedAt: new Date().toISOString(),
          assignedByAdmin: adminUsername || "Admin",
          adminNotes: `Advocate ${advocateName} appointed by Admin ${adminUsername || "Admin"}. 50 ICJ Token rewards granted.`,
        };
      }
      return c;
    });

    savePendingCases(updated);

    // Sync Legal Case record in icj_legal_cases_v2
    const legalCases = getLegalCases();
    const updatedLegal = legalCases.map((lc) => {
      if (lc.member_id === targetClientId || lc.clientName === targetClientName) {
        return {
          ...lc,
          advocateId,
          advocateName,
          status: "Advocate Assigned",
          trustApprovalStatus: "Approved by Trust Desk",
          updated_at: new Date().toISOString(),
        };
      }
      return lc;
    });
    saveLegalCases(updatedLegal);

    // Grant 50 ICJ Reward Tokens to Litigant and Advocate
    if (targetClientId) {
      TokenLedgerService.creditTokens(targetClientId, 50, "REWARD", `50 ICJ Reward Tokens for Advocate Appointment (${advocateName})`);
    }
    if (advocateId) {
      TokenLedgerService.creditTokens(advocateId, 50, "REWARD", `50 ICJ Reward Tokens for Case Appointment (${targetClientName})`);
    }

    ActivityService.create({
      title: `Advocate ${advocateName} Appointed`,
      type: "legal",
      details: `Appointed to client ${targetClientName || "Litigant"}. 50 ICJ Tokens rewarded.`,
    });

    return { success: true, requestId, advocateName };
  },

  /**
   * 5. Get workflow statistics summary
   */
  getStats() {
    const cases = getPendingCases();
    const total = cases.length;
    const pending = cases.filter((c) => c.status === "PENDING_ADMIN_REVIEW").length;
    const assigned = cases.filter((c) => c.status === "ADVOCATE_ASSIGNED").length;

    return { total, pending, assigned };
  },
};

export default ClientWorkflowService;
