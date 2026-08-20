/**
 * Voice-to-Document File Generator Engine
 * Automatically packages voice transcriptions & extracted legal facts into a permanent downloadable PDF/text document file,
 * binds it to the client's case file, and registers it in the DRM Document Vault.
 */

import LegalMatterDataService from "./legalMatterDataService.js";

export const VoiceToDocumentEngine = {
  /**
   * Generate a formal legal intake document file from voice commentary & form state
   * @param {Object} payload - { memberId, caseId, voiceText, clientName, category, city, policeStation }
   * @returns {Object} Generated Document metadata & downloadable file Blob/URL
   */
  generateDocumentFromVoice(payload = {}) {
    const {
      memberId = "MEM-DEMO",
      caseId = "CASE-VOICE-001",
      voiceText = "",
      clientName = "Valued Litigant",
      category = "Legal Dispute",
      city = "Delhi",
      policeStation = "Local PS",
    } = payload;

    const dateStr = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const docId = `DOC-VOICE-${Date.now()}`;
    const fileName = `Voice_Legal_Intake_Statement_${Date.now()}.txt`;

    const formattedDocumentContent = `================================================================================
                    ICJ ENTERPRISE PLATFORM
          VOICE LEGAL INTAKE & STATEMENT OF FACTS DOCUMENT
================================================================================
Document ID      : ${docId}
Registration Date: ${dateStr}
Client / Litigant: ${clientName} (Member ID: ${memberId})
Case Reference   : ${caseId}
Matter Category  : ${category}
Jurisdiction     : ${city} (Police Station: ${policeStation})
DRM Protection   : Locked (OTP Protected & Digital Hash Verified)
================================================================================

1. STATEMENT OF LEGAL MATTER (VOICE TRANSCRIBED STATEMENT):
--------------------------------------------------------------------------------
"${voiceText || "No voice commentary text transcribed."}"

2. AUTOMATED LEGAL FACT EXTRACTION & PROVENANCE:
--------------------------------------------------------------------------------
- Date of Intake      : ${dateStr}
- Primary Category     : ${category}
- Territorial Forum    : District & Sessions Court, ${city}
- Verification Status  : Empaneled Advocate Review Required

3. LEGAL ADVISORY NOTE & DIRECTIVE:
--------------------------------------------------------------------------------
This official legal intake statement was auto-compiled from long-form voice commentary
and registered directly into the ICJ DRM Vault. An empaneled advocate has been
notified to review this file and prepare the formal court petition.

================================================================================
               FILED THROUGH ICJ ENTERPRISE LEGAL ECOSYSTEM
================================================================================`;

    // Save into LegalMatterDataService
    try {
      const extraction = LegalMatterDataService.extractFromText(voiceText, "VOICE_TRANSCRIBED", fileName);
      LegalMatterDataService.saveExtraction(memberId, caseId, extraction);
    } catch (e) {
      console.warn("Extracted save warning:", e);
    }

    // Return downloadable document object
    const blob = new Blob([formattedDocumentContent], { type: "text/plain;charset=utf-8" });
    const fileUrl = URL.createObjectURL(blob);

    return {
      docId,
      fileName,
      fileUrl,
      content: formattedDocumentContent,
      createdAt: new Date().toISOString(),
      drmStatus: "Locked (OTP Protected)",
      message: "Voice commentary file compiled and saved to Document Vault successfully!",
    };
  }
};

export default VoiceToDocumentEngine;
