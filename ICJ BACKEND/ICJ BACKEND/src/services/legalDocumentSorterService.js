/**
 * LegalDocumentSorterService — ICJ Enterprise Platform
 * Provides Procedural Legal Stage Classification, Chronological Precedence Sorting,
 * and Dual-Naming Display (Client View vs Advocate/System View).
 */

export const LEGAL_STAGES = {
  STAGE_01_PLAINT_FIR: {
    id: "STAGE-01_PLAINT_FIR",
    precedence: 1,
    title: "Stage 01: Plaint / FIR / Original Complaint",
    shortCode: "PL-FIR",
    description: "Initial cause of action document filed at start of dispute.",
  },
  STAGE_02_WRITTEN_STATEMENT: {
    id: "STAGE-02_WRITTEN_STATEMENT",
    precedence: 2,
    title: "Stage 02: Written Statement (WS) / Counter Affidavit",
    shortCode: "WS-COUNTER",
    description: "Defendant's formal response and denials to plaint.",
  },
  STAGE_03_REPLICATION: {
    id: "STAGE-03_REPLICATION",
    precedence: 3,
    title: "Stage 03: Replication / Rejoinder / Reply Affidavit",
    shortCode: "REP-REJ",
    description: "Plaintiff's reply to new facts raised in Written Statement.",
  },
  STAGE_04_INTERIM_APPLICATION: {
    id: "STAGE-04_INTERIM_APPLICATION",
    precedence: 4,
    title: "Stage 04: Interim / Stay / Injunction Petitions",
    shortCode: "INTERIM-APP",
    description: "Urgent interim relief and stay applications filed during trial.",
  },
  STAGE_05_COURT_ORDER: {
    id: "STAGE-05_COURT_ORDER",
    precedence: 5,
    title: "Stage 05: Court Orders / Interim Decrees / Judgments",
    shortCode: "ORDER-JUDG",
    description: "Official proceedings, order sheets, and rulings issued by court.",
  },
  STAGE_06_EVIDENCE: {
    id: "STAGE-06_EVIDENCE",
    precedence: 6,
    title: "Stage 06: Evidence / Ex-Parte Records / Annexures",
    shortCode: "EVI-ANNEX",
    description: "Supporting documentary evidence, receipts, deeds, and records.",
  },
};

/**
 * Classify document type into standard legal stage
 */
export function detectLegalStage(fileName = "", title = "", category = "") {
  const text = `${fileName} ${title} ${category}`.toLowerCase();

  if (text.includes("fir") || text.includes("plaint") || text.includes("complaint") || text.includes("petition")) {
    return LEGAL_STAGES.STAGE_01_PLAINT_FIR;
  }
  if (text.includes("written statement") || text.includes("ws") || text.includes("counter") || text.includes("reply to plaint")) {
    return LEGAL_STAGES.STAGE_02_WRITTEN_STATEMENT;
  }
  if (text.includes("replication") || text.includes("rejoinder") || text.includes("rep") || text.includes("rebuttal")) {
    return LEGAL_STAGES.STAGE_03_REPLICATION;
  }
  if (text.includes("stay") || text.includes("injunction") || text.includes("interim") || text.includes("application") || text.includes("order 39")) {
    return LEGAL_STAGES.STAGE_04_INTERIM_APPLICATION;
  }
  if (text.includes("order") || text.includes("decree") || text.includes("judgment") || text.includes("ruling")) {
    return LEGAL_STAGES.STAGE_05_COURT_ORDER;
  }
  return LEGAL_STAGES.STAGE_06_EVIDENCE;
}

export const LegalDocumentSorterService = {
  /**
   * Sort array of documents in strict legal procedural order regardless of upload date
   */
  sortDocumentsProcedurally(docList = []) {
    if (!Array.isArray(docList)) return [];

    return [...docList].sort((a, b) => {
      const stageA = detectLegalStage(a.name || a.fileName, a.title, a.category);
      const stageB = detectLegalStage(b.name || b.fileName, b.title, b.category);

      // Primary sort by Legal Precedence (1 to 6)
      if (stageA.precedence !== stageB.precedence) {
        return stageA.precedence - stageB.precedence;
      }

      // Secondary sort by date if same stage
      const dateA = new Date(a.uploaded || a.created_at || a.date || 0);
      const dateB = new Date(b.uploaded || b.created_at || b.date || 0);
      return dateA - dateB;
    });
  },

  /**
   * Return Dual-Naming object for client vs advocate view
   */
  getDualNaming(doc, viewerRole = "client") {
    const originalName = doc.name || doc.fileName || doc.title || "Document.pdf";
    const stage = detectLegalStage(originalName, doc.title, doc.category);
    const dateStr = doc.uploaded || doc.date || new Date().toISOString().split("T")[0];

    const cleanName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_\-]/g, "_");
    const canonicalLegalName = `[${stage.id}]_${stage.shortCode}_${cleanName}_${dateStr}.pdf`;

    return {
      clientDisplayName: originalName,
      advocateCanonicalName: canonicalLegalName,
      displayName: viewerRole === "advocate" || viewerRole === "admin" || viewerRole === "super_admin" 
        ? canonicalLegalName 
        : originalName,
      stageInfo: stage,
    };
  },
};

export default LegalDocumentSorterService;
