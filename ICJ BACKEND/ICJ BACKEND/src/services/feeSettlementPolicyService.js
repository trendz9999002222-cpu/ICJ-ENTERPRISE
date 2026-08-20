/**
 * FeeSettlementPolicyService — ICJ Enterprise Platform
 * Provides 100% Fee Settlement Transparency, Advocate Agreement Compliance Tracking,
 * Section 73 Indian Contract Act Recovery Demand Generator, and BCI Misconduct Escalation.
 */

const FEE_SETTLEMENTS_KEY = "icj_fee_settlements";

export const FeeSettlementPolicyService = {
  /**
   * Get all fee declarations and settlement records
   */
  getSettlements() {
    try {
      const raw = localStorage.getItem(FEE_SETTLEMENTS_KEY);
      return raw ? JSON.parse(raw) : [
        {
          id: "SETTLE-2001",
          advocateName: "Empaneled Senior Counsel",
          advocateRegNo: "D/1024/2012",
          clientName: "Empaneled Litigant",
          totalFeeReceived: 25000,
          platformTechShare: 2500,
          status: "PAID",
          declarationDate: new Date(Date.now() - 864000000).toISOString(),
          demandNoticeGenerated: false,
        },
        {
          id: "SETTLE-2002",
          advocateName: "Adv. Vikram Verma",
          advocateRegNo: "D/2048/2018",
          clientName: "Suresh Gupta",
          totalFeeReceived: 50000,
          platformTechShare: 5000,
          status: "DEFAULTED",
          declarationDate: new Date(Date.now() - 1728000000).toISOString(),
          demandNoticeGenerated: true,
        },
      ];
    } catch {
      return [];
    }
  },

  /**
   * Generate Legal Recovery Demand Notice under Section 73 Indian Contract Act 1872
   */
  generateRecoveryNotice({ advocateName, advocateRegNo, clientName, defaultedAmount }) {
    const issueDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

    return `LEGAL RECOVERY DEMAND NOTICE UNDER SECTION 73 OF THE INDIAN CONTRACT ACT, 1872
RE: BREACH OF ADVOCATE EMPANELMENT & PLATFORM TECHNOLOGY AGREEMENT

TO:
${advocateName || "Advocate Name"}
Enrollment No: ${advocateRegNo || "D/VERIFIED"}

WHEREAS:
1. You are an empanelled advocate on the ICJ Enterprise Platform bound by the Advocate Technology Empanelment Agreement.
2. Client (${clientName || "Litigant"}) was connected to you through the ICJ Legal Ecosystem & Trust Infrastructure.
3. You have received professional legal fees from the said client and failed/defaulted to remit the agreed Platform Technology Share amounting to ₹ ${defaultedAmount || "5,000.00"}.

TAKE NOTICE:
You are hereby called upon to remit the defaulted amount of ₹ ${defaultedAmount || "5,000.00"} within 7 days of this notice, failing which:
A) Your ICJ Enterprise Account shall remain INSTANTLY SUSPENDED & BLOCKED.
B) Formal Complaint of Professional Misconduct under Rule 36 of Bar Council of India Rules shall be filed with the State Bar Council.
C) Civil Suit for Recovery of Damages under Section 73 & Section 74 of the Indian Contract Act 1872 shall be instituted.

ISSUED ON: ${issueDate}
BY: ICJ Enterprise Legal & Compliance Directorate`;
  },

  /**
   * Generate Bar Council Ethics Complaint Draft
   */
  generateBCIMisconductComplaint({ advocateName, advocateRegNo, defaultedAmount }) {
    return `BEFORE THE DISCIPLINARY COMMITTEE, STATE BAR COUNCIL
COMPLAINT OF PROFESSIONAL MISCONDUCT UNDER BAR COUNCIL RULES

COMPLAINANT: ICJ Enterprise Legal Trust Directorate
RESPONDENT: ${advocateName} (Enrollment No: ${advocateRegNo})

SUBJECT: Complaint regarding breach of professional ethics, concealment of platform client fees, and default of agreement obligations.

FACTS:
The Respondent Advocate engaged with platform clients, accepted professional fees, and concealed/defaulted on agreed tech share remittances of ₹ ${defaultedAmount}. 

PRAYER:
Kindly initiate Disciplinary Proceedings against the Respondent Advocate for Professional Misconduct in terms of Section 35 of the Advocates Act 1961.`;
  },
};

export default FeeSettlementPolicyService;
