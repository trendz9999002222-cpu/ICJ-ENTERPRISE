/**
 * ClientWorkflowService — ICJ Enterprise Platform
 * Handles Client Problem Submission, Admin Alert Notifications,
 * Advocate Assignment Queue, Free Credit Grants, and Real-time Status Sync.
 */

const PENDING_CLIENT_CASES_KEY = "icj_pending_client_cases";

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

export const ClientWorkflowService = {
  /**
   * 1. Client submits a new problem (from ClientPortal)
   */
  submitProblemRequest({ clientId, clientName, problemText, caseCategory, desiredOutcome, voiceNoteSummary }) {
    const requestId = `REQ-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newRequest = {
      requestId,
      clientId,
      clientName: clientName || "Litigant",
      problemText: (problemText || voiceNoteSummary || "").trim(),
      caseCategory: caseCategory || "general",
      desiredOutcome: desiredOutcome || "Legal Consultation & Advocate Assignment",
      timestamp,
      status: "PENDING_ADMIN_REVIEW",
      assignedAdvocateId: null,
      assignedAdvocateName: null,
      assignedAt: null,
      grantedCredit: 0,
      adminNotes: "Submitted. Awaiting Admin review and Advocate appointment.",
    };

    const cases = getPendingCases();
    cases.unshift(newRequest);
    savePendingCases(cases);

    return newRequest;
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
   * 4. Admin Appoints Advocate to a Client Case
   */
  appointAdvocate({ requestId, advocateId, advocateName, adminUsername }) {
    const cases = getPendingCases();
    const updated = cases.map((c) => {
      if (c.requestId === requestId) {
        return {
          ...c,
          status: "ADVOCATE_ASSIGNED",
          assignedAdvocateId: advocateId,
          assignedAdvocateName: advocateName,
          assignedAt: new Date().toISOString(),
          assignedByAdmin: adminUsername || "Admin",
          adminNotes: `Advocate ${advocateName} appointed by Admin ${adminUsername || "Admin"}. AI Legal Drafter notified.`,
        };
      }
      return c;
    });

    savePendingCases(updated);
    return { success: true, requestId, advocateName };
  },

  /**
   * 5. Admin Grants Free AI Credit or Requests Recharge
   */
  grantCredits({ requestId, clientId, creditAmount, adminUsername, actionType = "GRANT" }) {
    // Top up client wallet in storage if member exists
    try {
      const rawMembers = localStorage.getItem("icj_members");
      if (rawMembers) {
        const members = JSON.parse(rawMembers);
        const updatedMembers = members.map((m) => {
          if (m.id === clientId || m.member_id === clientId) {
            const currentBal = Number(m.wallet_balance || 0);
            return { ...m, wallet_balance: currentBal + Number(creditAmount) };
          }
          return m;
        });
        localStorage.setItem("icj_members", JSON.stringify(updatedMembers));
      }
    } catch (e) {
      console.error("Wallet update failed", e);
    }

    const cases = getPendingCases();
    const updated = cases.map((c) => {
      if (c.requestId === requestId) {
        return {
          ...c,
          grantedCredit: (c.grantedCredit || 0) + Number(creditAmount),
          adminNotes: actionType === "GRANT" 
            ? `Admin ${adminUsername || "Admin"} granted ${creditAmount} Free AI Credits to client.`
            : `Admin ${adminUsername || "Admin"} requested wallet recharge of ₹${creditAmount}.`,
        };
      }
      return c;
    });

    savePendingCases(updated);
    return { success: true, clientId, creditAmount };
  },

  /**
   * 6. Get latest status for client portal display
   */
  getClientLatestStatus(clientId) {
    const cases = getPendingCases();
    const clientCases = cases.filter((c) => c.clientId === clientId);
    return clientCases[0] || null;
  },
};

export default ClientWorkflowService;
