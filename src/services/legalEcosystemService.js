/**
 * LegalEcosystemService — Comprehensive AI Legal Management Backend for ICJ Enterprise Platform
 * Provides complete data management for Cases, Timelines, Hearings, Advocate Assignments,
 * Trust Approvals, Court Orders, Invoices, Billing, Revenue Sharing, OCR, and AI Legal Drafting.
 */

const STORAGE_KEYS = {
  cases: "icj_legal_cases_v2",
  timelines: "icj_case_timelines",
  hearings: "icj_court_hearings",
  advocates: "icj_advocates",
  orders: "icj_court_orders",
  invoices: "icj_invoices",
  trustApprovals: "icj_trust_approvals",
  aiDrafts: "icj_ai_drafts",
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

// Initial Seed Data if empty
const seedDefaultData = () => {
  if (getItem(STORAGE_KEYS.advocates).length === 0) {
    setItem(STORAGE_KEYS.advocates, [
      { id: "ADV-101", name: "Adv. Rajesh Sharma", barId: "MAH/1234/2012", specialization: "Constitutional & Civil Law", casesAssigned: 4, status: "Active", phone: "+91 98201 12345" },
      { id: "ADV-102", name: "Adv. Meera Sen", barId: "DEL/5678/2015", specialization: "Corporate & Financial Law", casesAssigned: 2, status: "Active", phone: "+91 98100 54321" },
      { id: "ADV-103", name: "Adv. Amit Varma", barId: "KAR/9012/2018", specialization: "Criminal & Human Rights", casesAssigned: 3, status: "Active", phone: "+91 97400 98765" },
    ]);
  }

  if (getItem(STORAGE_KEYS.cases).length === 0) {
    setItem(STORAGE_KEYS.cases, [
      {
        id: "CASE-4YR-RESCUE-001",
        caseNumber: "UPHC-01-004812-2022",
        title: "Sh. Ramesh Kumar vs State of UP & Ors (Land Title & Criminal Dispute)",
        clientName: "Sh. Ramesh Kumar (Litigant ID: MEM-LKO-9812)",
        advocateName: "Adv. Rajesh Sharma (Current ICJ Advocate)",
        advocateId: "ADV-101",
        courtName: "District & Sessions Court, Lucknow",
        status: "In Hearing (Transferred to ICJ)",
        trustApprovalStatus: "Approved & Escrow Protected",
        nextHearing: "2026-08-22",
        filingDate: "2022-04-12", // 4 Years Ago!
        icjTransferDate: "2025-08-10", // 1 Year Ago Transferred to ICJ!
        is4YearOldCase: true,
        previousLawyer: "Adv. P.K. Verma (Dismissed due to 8 missed hearings & ₹45,000 fee taken with no progress)",
        summary: "4 साल पुराना सिविल व क्रिमिनल मामला। 1 साल पहले पुराने वकील की लापरवाही से दुखी होकर ICJ में स्थानांतरित हुआ।",
        legalProvisions: ["BNSS 2023 Sec 482 (Anticipatory Bail)", "CPC Order 39 Rule 1&2 (Stay Order)", "BNS 2023 Sec 352"],
        feeAmount: 65000,
        paidAmount: 50000,
        advocateSharePaid: 35000, // 70% Released to Advocate for Arguments
        trustSharePaid: 15000,   // 30% ICJ Trust Service Charge (80G Tax Receipt ICJ-80G-2025-9812)
        escrowBalance: 15000,    // Locked in ICJ Escrow Treasury
        hearingsStats: {
          totalInIcj: 12,
          advocateAttended: 5,  // High stakes argument dates
          clientSelfAttended: 7, // Routine dates ("अपनी वकालत खुद करें")
          travelFeeSaved: 24500, // INR saved for Client!
        },
        vaultDocs: [
          { name: "FIR_Copy_Crime_412_2022.pdf", uploaded: "2025-08-10", drm: "Locked (OTP Protected)" },
          { name: "SaleDeed_Plot42_Lucknow.pdf", uploaded: "2025-08-12", drm: "Locked (OTP Protected)" },
          { name: "HighCourt_Interim_StayOrder_Jan2026.pdf", uploaded: "2026-01-14", drm: "Locked (OTP Protected)" },
          { name: "Vakalatnama_Adv_Rajesh_Sharma.pdf", uploaded: "2025-08-15", drm: "e-Signed" },
        ],
      },
      {
        id: "CASE-2026-001",
        caseNumber: "WP/2026/1042",
        title: "Public Interest Litigation: Environment Conservation Trust vs Union of India",
        clientName: "Green Earth Trust",
        advocateName: "Adv. Rajesh Sharma",
        advocateId: "ADV-101",
        courtName: "High Court of Judicature",
        status: "In Hearing",
        trustApprovalStatus: "Approved",
        nextHearing: "2026-08-20",
        filingDate: "2026-01-15",
        summary: "PIL seeking injunctive relief against unauthorized deforestation in protected bio-reserves.",
        missingDocs: ["Environmental Impact Assessment Certificate 2025"],
        legalProvisions: ["Article 21 (Right to Clean Environment)", "Environment Protection Act Sec 3"],
        feeAmount: 45000,
        paidAmount: 30000,
      },
      {
        id: "CASE-2026-002",
        caseNumber: "CS/2026/0488",
        title: "Commercial Contract Recovery & Arbitration",
        clientName: "Apex Technovations Pvt Ltd",
        advocateName: "Adv. Meera Sen",
        advocateId: "ADV-102",
        courtName: "District Commercial Court",
        status: "Pending Approval",
        trustApprovalStatus: "Under Review",
        nextHearing: "2026-08-28",
        filingDate: "2026-03-10",
        summary: "Recovery petition under Arbitration and Conciliation Act for non-payment of software licensing fees.",
        missingDocs: ["Certified Copy of SLA Agreement"],
        legalProvisions: ["Arbitration & Conciliation Act Sec 9", "Indian Contract Act Sec 73"],
        feeAmount: 75000,
        paidAmount: 25000,
      },
    ]);
  }

  if (getItem(STORAGE_KEYS.hearings).length === 0) {
    setItem(STORAGE_KEYS.hearings, [
      { id: "H-1", caseId: "CASE-2026-001", caseTitle: "PIL: Environment Conservation", hearingDate: "2026-08-20", court: "High Court Bench 3", judge: "Hon'ble Justice A.K. Roy", purpose: "Final Arguments", status: "Scheduled" },
      { id: "H-2", caseId: "CASE-2026-002", caseTitle: "Commercial Contract Recovery", hearingDate: "2026-08-28", court: "Commercial Court 2", judge: "Hon'ble Judge V. Nair", purpose: "Admission & Interim Relief", status: "Scheduled" },
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

    // Create Initial Timeline Record
    this.addTimelineEvent(id, {
      title: "Case Registered",
      description: `Case "${newCase.title}" was submitted for review.`,
      by: caseData.clientName || "Client",
    });

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

  // Advocate Assignment
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

    this.addTimelineEvent(caseId, {
      title: "Advocate Assigned",
      description: `${advocate.name} (${advocate.barId}) was assigned to lead this case.`,
      by: "Trust Administration",
    });
  },

  // Case Timeline & Hearing Management
  getCaseTimeline(caseId) {
    const timelines = getItem(STORAGE_KEYS.timelines, {});
    return timelines[caseId] || [];
  },

  addTimelineEvent(caseId, event) {
    const timelines = getItem(STORAGE_KEYS.timelines, {});
    const existing = timelines[caseId] || [];
    const newEvent = {
      id: `TL-${Date.now()}`,
      title: event.title,
      description: event.description,
      date: new Date().toISOString().slice(0, 10),
      timestamp: new Date().toISOString(),
      by: event.by || "System",
    };
    timelines[caseId] = [newEvent, ...existing];
    setItem(STORAGE_KEYS.timelines, timelines);
  },

  getHearings() {
    return getItem(STORAGE_KEYS.hearings);
  },

  addHearing(hearingData) {
    const hearings = this.getHearings();
    const newHearing = {
      id: `H-${Date.now()}`,
      caseId: hearingData.caseId,
      caseTitle: hearingData.caseTitle,
      hearingDate: hearingData.hearingDate,
      court: hearingData.court || "Court Room 1",
      judge: hearingData.judge || "Hon'ble Presiding Judge",
      purpose: hearingData.purpose || "Hearing",
      status: "Scheduled",
      createdAt: new Date().toISOString(),
    };
    const updated = [newHearing, ...hearings];
    setItem(STORAGE_KEYS.hearings, updated);

    // Update case next hearing
    const cases = this.getCases();
    const updatedCases = cases.map((c) => {
      if (c.id === hearingData.caseId) {
        return { ...c, nextHearing: hearingData.hearingDate };
      }
      return c;
    });
    setItem(STORAGE_KEYS.cases, updatedCases);

    return newHearing;
  },

  // Billing, Invoicing & Revenue Sharing
  getInvoices() {
    const cases = this.getCases();
    return cases.map((c) => {
      const remaining = Math.max(0, c.feeAmount - c.paidAmount);
      const advocateShare = Math.round(c.feeAmount * 0.7); // 70% advocate share
      const trustShare = Math.round(c.feeAmount * 0.3);    // 30% ICJ Trust share
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

  recordPayment(caseId, amount) {
    const cases = this.getCases();
    const updated = cases.map((c) => {
      if (c.id === caseId) {
        return { ...c, paidAmount: (c.paidAmount || 0) + Number(amount) };
      }
      return c;
    });
    setItem(STORAGE_KEYS.cases, updated);
  },

  // AI Legal Intelligence & Drafting Engine
  analyzeCaseDocuments(caseTitle, documentText) {
    const docLen = documentText.length;
    const summary = `AI Summary for "${caseTitle}": Document analysis indicates a total of ${docLen} characters evaluated. Key themes identified include contractual obligation, timeline compliance, statutory relief under Civil & Constitutional law frameworks.`;
    
    const missingDocs = [];
    if (!documentText.toLowerCase().includes("aadhaar") && !documentText.toLowerCase().includes("id")) {
      missingDocs.push("Verified Identity Proof (Aadhaar / Passport)");
    }
    if (!documentText.toLowerCase().includes("agreement") && !documentText.toLowerCase().includes("contract")) {
      missingDocs.push("Signed Executed Agreement / Deed");
    }
    if (!documentText.toLowerCase().includes("affidavit")) {
      missingDocs.push("Notarized Supporting Affidavit");
    }

    const provisions = [
      "Constitution of India — Article 14 (Equality before Law)",
      "Constitution of India — Article 21 (Right to Life & Personal Liberty)",
      "Code of Civil Procedure, 1908 — Order XXXIX Rules 1 & 2 (Interim Injunctions)",
      "Specific Relief Act, 1963 — Section 34 (Declaratory Decrees)",
    ];

    return {
      summary,
      missingDocs: missingDocs.length > 0 ? missingDocs : ["All core mandatory filings detected"],
      suggestedProvisions: provisions,
      recommendedStrategy: "File urgent petition seeking ad-interim relief in court of competent jurisdiction while pursuing arbitration proceedings.",
      disclaimer: "AI-generated analysis. Requires advocate review prior to official submission.",
    };
  },

  generateLegalDraft(type, caseDetails) {
    const year = new Date().getFullYear();
    const title = caseDetails.title || "Legal Petition";
    const client = caseDetails.clientName || "Petitioner";
    const court = caseDetails.courtName || "IN THE HIGH COURT OF JUDICATURE";

    let draftContent;

    if (type === "Notice") {
      draftContent = `LEGAL NOTICE UNDER SECTION 80 CPC
Ref No: ICJ/LN/${year}/${Math.floor(1000 + Math.random() * 9000)}

TO:
The Concerned Authority / Respondent,

SUBJECT: DEMAND FOR IMMEDIATE COMPLIANCE & CEASE DESIST NOTICE IN RESPECT OF ${(title || "Legal Matter").toUpperCase()}

Sir / Madam,

Under instructions from and on behalf of our client, ${client}, we hereby serve upon you this Legal Notice:

1. That our client is a law-abiding entity/individual pursuing legitimate rights.
2. That in respect of "${title}", your failure to act in accordance with statutory mandates has caused severe legal prejudice.
3. YOU ARE HEREBY CALLED UPON to perform the required statutory compliance within 15 DAYS of receipt of this notice, failing which our client will institute appropriate civil and criminal proceedings in a Court of Law at your sole risk and expense.

DATED: ${new Date().toLocaleDateString("en-IN")}
ADVOCATE FOR PETITIONER / ICJ LEGAL PANEL`;
    } else if (type === "Petition") {
      draftContent = `IN THE COURT OF ${(court || "District & Sessions Court").toUpperCase()}
WRIT PETITION NO. _______ OF ${year}

IN THE MATTER OF:
${client} ... PETITIONER
VERSUS
RESPONDENT UNION OF INDIA & ORS ... RESPONDENTS

PETITION UNDER ARTICLE 226/227 OF THE CONSTITUTION OF INDIA FOR ISSUANCE OF A WRIT OF MANDAMUS / CERTIORARI

MOST RESPECTFULLY SHOWETH:
1. That the Petitioner is filing the present Writ Petition challenging the arbitrary actions in respect of "${title}".
2. That the facts giving rise to the present petition are as follows:
   (a) The Petitioner submitted representations to the concerned authorities.
   (b) That no response or remedy was granted, violating principles of natural justice and Article 14 of the Constitution.
3. PRAYER:
   It is most respectfully prayed that this Hon'ble Court may be pleased to:
   (i) Issue an appropriate writ, order or direction setting aside the impugned order;
   (ii) Grant ad-interim ex-parte injunction during the pendency of this petition.

AND FOR THIS ACT OF KINDNESS, THE PETITIONER SHALL EVER PRAY.
FILED BY: ICJ ENTERPRISE LEGAL ECOSYSTEM PANEL`;
    } else {
      draftContent = `LEGAL OPINION & CASE CHRONOLOGY
CASE TITLE: ${title}
CLIENT: ${client}
DATE OF ANALYSIS: ${new Date().toLocaleDateString("en-IN")}

1. EXECUTIVE SUMMARY & CHRONOLOGY:
   - Initial filing and registration completed.
   - Primary contention revolves around enforcement of rights under Indian Law.

2. LEGAL PROVISIONS & PRECEDENTS:
   - Article 14 & 21, Constitution of India.
   - Landmark judgment: Maneka Gandhi v. Union of India (1978 AIR 597).

3. STRATEGIC RECOMMENDATION:
   - File preliminary rejoinder and request expedited hearing date.

NOTE: This draft was auto-generated by ICJ Enterprise AI Legal Assistant. Mandatory review by empaneled Advocate is required before court filing.`;
    }

    return draftContent;
  },
};

export default LegalEcosystemService;
