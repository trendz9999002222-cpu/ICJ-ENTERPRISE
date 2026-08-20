/**
 * ProceduralChronologyEngine — ICJ Enterprise Platform
 * Automatic Procedural Chronology Ordering Engine (CPC & CrPC Mandatory Stage Order).
 * Re-orders randomly uploaded court documents into strict procedural legal sequence:
 * 1. Plaint / FIR
 * 2. Summons & Service
 * 3. Written Statement / Reply
 * 4. Replication / Rejoinder
 * 5. Framing of Issues / Charges
 * 6. Interim Orders & Stay
 * 7. Evidence & Depositions
 * 8. Final Arguments
 * 9. Final Judgment & Decree
 */

export const JUDICIAL_STAGE_PIPELINE = [
  { id: "01_PLAINT_OR_FIR", name: "Stage 1: Plaint / FIR Copy", keywords: ["plaint", "petition", "fir", "complaint"] },
  { id: "02_SUMMONS_SERVICE", name: "Stage 2: Summons & Service Proof", keywords: ["summons", "notice", "service"] },
  { id: "03_WRITTEN_STATEMENT", name: "Stage 3: Written Statement / Reply", keywords: ["written statement", "ws", "counter affidavit", "reply"] },
  { id: "04_REPLICATION_REJOINDER", name: "Stage 4: Replication / Rejoinder", keywords: ["replication", "rejoinder", "response"] },
  { id: "05_FRAMING_OF_ISSUES", name: "Stage 5: Framing of Issues / Charges", keywords: ["issues", "charge sheet", "framing"] },
  { id: "06_INTERIM_ORDERS", name: "Stage 6: Interim Orders & Stay", keywords: ["stay", "injunction", "interim order", "direction"] },
  { id: "07_EVIDENCE_DEPOSITIONS", name: "Stage 7: Evidence & Depositions", keywords: ["evidence", "witness", "cross-examination", "deposition", "affidavit in evidence"] },
  { id: "08_FINAL_ARGUMENTS", name: "Stage 8: Final Arguments & Memos", keywords: ["written arguments", "precedents", "submissions"] },
  { id: "09_JUDGMENT_DECREE", name: "Stage 9: Final Judgment & Decree", keywords: ["judgment", "decree", "order", "disposed"] },
];

export const ProceduralChronologyEngine = {
  /**
   * Automatically detect judicial stage of a legal document from title/content
   */
  detectDocumentStage(fileName = "", content = "") {
    const text = (fileName + " " + content).toLowerCase();
    for (const stage of JUDICIAL_STAGE_PIPELINE) {
      if (stage.keywords.some((kw) => text.includes(kw))) {
        return stage;
      }
    }
    return JUDICIAL_STAGE_PIPELINE[0]; // Default to Stage 1
  },

  /**
   * Sort randomly uploaded document list into strict procedural legal sequence
   */
  sortDocumentsByJudicialStage(documentsArray = []) {
    if (!Array.isArray(documentsArray)) return [];
    return [...documentsArray].sort((a, b) => {
      const stageA = this.detectDocumentStage(a.fileName || a.name, a.content || "");
      const stageB = this.detectDocumentStage(b.fileName || b.name, b.content || "");
      return JUDICIAL_STAGE_PIPELINE.findIndex((s) => s.id === stageA.id) -
             JUDICIAL_STAGE_PIPELINE.findIndex((s) => s.id === stageB.id);
    });
  },
};

export default ProceduralChronologyEngine;
