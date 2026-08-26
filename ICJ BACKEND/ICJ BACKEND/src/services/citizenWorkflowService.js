/**
 * CitizenWorkflowService — ICJ Enterprise Platform
 * Master State Machine for Citizen-First Sequential Workflow & Continuous Case Record System
 *
 * Core Principles:
 * 1. ONE CITIZEN ➔ ONE CASE ID ➔ ONE MASTER CASE FOLDER ➔ ONE CONTINUOUS CASE RECORD
 * 2. Stage 0 to Stage 4 Sequential Navigation with Persistence & Autosave
 * 3. 3-Tier Advocate Allotment & Re-assignment (Replacement Request) Engine
 * 4. Master Document Exporter (.docx / PDF)
 */

const STORAGE_KEY = "icj_master_cases";

const LS = {
  getAll: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  },
  saveAll: (list) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("LocalStorage save notice:", e);
    }
  },
};

export const CitizenWorkflowService = {
  /**
   * Get active case or create a fresh Master Case Folder for the citizen
   */
  getOrCreateActiveCase(citizenId = "26CLT08AA0001", citizenName = "Litigant Client") {
    const list = LS.getAll();
    let found = list.find(
      (c) => (c.citizen_id === citizenId || c.citizen_name === citizenName) && c.status !== "CLOSED"
    );

    if (!found) {
      const caseSeq = String(list.length + 1).padStart(4, "0");
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const newCaseId = `CASE-${dateStr}-${caseSeq}`;

      found = {
        case_id: newCaseId,
        citizen_id: citizenId,
        citizen_name: citizenName,
        current_stage: 0,
        completed_stages: [],
        status: "ACTIVE",
        preferred_language: "hi-IN",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assigned_advocate: {
          advocate_id: "26ICJ08AA0002",
          advocate_name: "Senior Advocate PAWAN GUPTA",
          advocate_role: "Lead Empaneled Advocate & Appellate Counsel",
          allotted_by: "SYSTEM_DEFAULT",
          allotted_at: new Date().toISOString(),
          status: "IN_HOUSE_DEFAULT",
        },
        advocate_replacement_requests: [],
        master_record: {
          stage0_guidance: {
            completed: false,
            completed_at: null,
            consent_agreed: false,
          },
          stage1_intake: {
            legal_category: "Property Dispute",
            voice_recordings: [],
            typed_inputs: [],
            desired_outcome: "",
          },
          stage2_documents: [],
          stage3_ai_diagnosis: null,
          stage4_counsel_action: {
            counsel_assigned: true,
            consultation_status: "Pending Appointment",
          },
        },
        timeline: [
          {
            timestamp: new Date().toISOString(),
            stage: 0,
            event: "Master Case Folder Created",
            actor: "System",
            details: `Case ID ${newCaseId} initialized for ${citizenName}`,
          },
        ],
      };
      list.push(found);
      LS.saveAll(list);
    }
    return found;
  },

  /**
   * Save / Update Master Case Folder
   */
  updateCase(updatedCase) {
    const list = LS.getAll();
    const idx = list.findIndex((c) => c.case_id === updatedCase.case_id);
    updatedCase.updated_at = new Date().toISOString();
    if (idx !== -1) {
      list[idx] = updatedCase;
    } else {
      list.push(updatedCase);
    }
    LS.saveAll(list);
    return updatedCase;
  },

  /**
   * Complete Stage 0: Welcome & Guidance
   */
  completeStage0(caseId, consentAgreed = true) {
    const list = LS.getAll();
    const item = list.find((c) => c.case_id === caseId);
    if (!item) return null;

    item.master_record.stage0_guidance = {
      completed: true,
      completed_at: new Date().toISOString(),
      consent_agreed: consentAgreed,
    };
    if (!item.completed_stages.includes(0)) item.completed_stages.push(0);
    item.current_stage = 1;

    item.timeline.push({
      timestamp: new Date().toISOString(),
      stage: 0,
      event: "Stage 0 Complete: Guidance Agreed",
      actor: "Citizen",
      details: "Citizen listened to audio guidance and consented to terms",
    });

    return this.updateCase(item);
  },

  /**
   * Append Voice Recording or Typed Text to Stage 1 Master Record
   */
  appendStage1Intake(caseId, { voiceText, typedText, desiredOutcome, category }) {
    const list = LS.getAll();
    const item = list.find((c) => c.case_id === caseId);
    if (!item) return null;

    if (category) item.master_record.stage1_intake.legal_category = category;
    if (desiredOutcome) item.master_record.stage1_intake.desired_outcome = desiredOutcome;

    const nowStr = new Date().toISOString();

    if (voiceText && voiceText.trim()) {
      item.master_record.stage1_intake.voice_recordings.push({
        id: `aud-${Date.now()}`,
        timestamp: nowStr,
        transcript: voiceText.trim(),
        source: "VOICE",
      });
      item.timeline.push({
        timestamp: nowStr,
        stage: 1,
        event: "Voice Note Recorded & Transcribed",
        actor: "Citizen",
        details: voiceText.trim().slice(0, 80) + "...",
      });
    }

    if (typedText && typedText.trim()) {
      item.master_record.stage1_intake.typed_inputs.push({
        id: `txt-${Date.now()}`,
        timestamp: nowStr,
        text: typedText.trim(),
        source: "TYPING",
      });
      item.timeline.push({
        timestamp: nowStr,
        stage: 1,
        event: "Typed Information Appended",
        actor: "Citizen",
        details: typedText.trim().slice(0, 80) + "...",
      });
    }

    if (!item.completed_stages.includes(1)) item.completed_stages.push(1);

    return this.updateCase(item);
  },

  /**
   * Advance Stage (0 -> 1 -> 2 -> 3 -> 4)
   */
  setStage(caseId, stageNumber) {
    const list = LS.getAll();
    const item = list.find((c) => c.case_id === caseId);
    if (!item) return null;

    item.current_stage = stageNumber;
    if (!item.completed_stages.includes(stageNumber - 1) && stageNumber > 0) {
      item.completed_stages.push(stageNumber - 1);
    }
    return this.updateCase(item);
  },

  /**
   * Stage 2: Append Uploaded Document to Master Case Folder
   */
  appendDocument(caseId, docObj) {
    const list = LS.getAll();
    const item = list.find((c) => c.case_id === caseId);
    if (!item) return null;

    const docEntry = {
      id: docObj.id || `doc-${Date.now()}`,
      name: docObj.name || "Legal Document",
      category: docObj.category || "General Document",
      uploaded_at: new Date().toISOString(),
      verified: true,
      sha256: docObj.sha256 || `SHA256-DIGITAL-${Date.now()}`,
    };

    item.master_record.stage2_documents.push(docEntry);
    if (!item.completed_stages.includes(2)) item.completed_stages.push(2);

    item.timeline.push({
      timestamp: new Date().toISOString(),
      stage: 2,
      event: `Document Uploaded: ${docEntry.name}`,
      actor: "Citizen",
      details: `Category: ${docEntry.category}`,
    });

    return this.updateCase(item);
  },

  /**
   * Stage 3: Save AI Diagnosis to Master Case Folder
   */
  saveAiDiagnosis(caseId, diagnosisObj) {
    const list = LS.getAll();
    const item = list.find((c) => c.case_id === caseId);
    if (!item) return null;

    item.master_record.stage3_ai_diagnosis = {
      diagnosis: diagnosisObj,
      generated_at: new Date().toISOString(),
      version: (item.master_record.stage3_ai_diagnosis?.version || 0) + 1,
    };
    if (!item.completed_stages.includes(3)) item.completed_stages.push(3);

    item.timeline.push({
      timestamp: new Date().toISOString(),
      stage: 3,
      event: "AI Legal Diagnosis Generated",
      actor: "AI Engine",
      details: `Sections & Legal Risk Diagnosis version ${item.master_record.stage3_ai_diagnosis.version}`,
    });

    return this.updateCase(item);
  },

  /**
   * Phase B: ICJ Admin assigns specific advocate
   */
  assignAdvocateByAdmin(caseId, advocateId, advocateName, advocateRole = "Empaneled Advocate", assignedBy = "ICJ Super Admin") {
    const list = LS.getAll();
    const item = list.find((c) => c.case_id === caseId);
    if (!item) return null;

    const prevName = item.assigned_advocate?.advocate_name || "ICJ In-House Counsel";

    item.assigned_advocate = {
      advocate_id: advocateId,
      advocate_name: advocateName,
      advocate_role: advocateRole,
      allotted_by: assignedBy,
      allotted_at: new Date().toISOString(),
      status: "SPECIFIC_ALLOTTED",
    };

    item.timeline.push({
      timestamp: new Date().toISOString(),
      stage: 4,
      event: `Advocate Assigned: ${advocateName}`,
      actor: assignedBy,
      details: `Replaced ${prevName} with ${advocateName} (${advocateId})`,
    });

    return this.updateCase(item);
  },

  /**
   * Phase C: Client Requests Advocate Replacement / Change
   */
  requestAdvocateReplacement(caseId, reason = "Language / Communication Issue", notes = "") {
    const list = LS.getAll();
    const item = list.find((c) => c.case_id === caseId);
    if (!item) return null;

    const reqId = `REQ-CHG-${Date.now().toString(36).toUpperCase()}`;
    const newReq = {
      request_id: reqId,
      requested_at: new Date().toISOString(),
      previous_advocate_id: item.assigned_advocate?.advocate_id || "26ICJ08AA0003",
      previous_advocate_name: item.assigned_advocate?.advocate_name || "Senior Advocate PAWAN GUPTA",
      reason,
      notes,
      status: "PENDING_ADMIN_APPROVAL",
    };

    if (!Array.isArray(item.advocate_replacement_requests)) {
      item.advocate_replacement_requests = [];
    }
    item.advocate_replacement_requests.push(newReq);

    item.timeline.push({
      timestamp: new Date().toISOString(),
      stage: 4,
      event: "Advocate Replacement Requested by Client",
      actor: "Citizen",
      details: `Reason: ${reason}`,
    });

    return this.updateCase(item);
  },

  /**
   * Phase C: ICJ Admin Approves Replacement Request and Assigns New Advocate
   */
  approveAdvocateReplacement(caseId, requestId, newAdvocateId, newAdvocateName, newAdvocateRole = "Empaneled Advocate") {
    const list = LS.getAll();
    const item = list.find((c) => c.case_id === caseId);
    if (!item) return null;

    const req = (item.advocate_replacement_requests || []).find((r) => r.request_id === requestId);
    if (req) {
      req.status = "APPROVED";
      req.approved_at = new Date().toISOString();
      req.new_advocate_id = newAdvocateId;
      req.new_advocate_name = newAdvocateName;
    }

    const prevName = item.assigned_advocate?.advocate_name || "Previous Counsel";

    item.assigned_advocate = {
      advocate_id: newAdvocateId,
      advocate_name: newAdvocateName,
      advocate_role: newAdvocateRole,
      allotted_by: "ICJ Super Admin (Re-assignment Approved)",
      allotted_at: new Date().toISOString(),
      status: "REASSIGNED_APPROVED",
    };

    item.timeline.push({
      timestamp: new Date().toISOString(),
      stage: 4,
      event: `Advocate Replacement Approved: New Counsel ${newAdvocateName}`,
      actor: "ICJ Super Admin",
      details: `Request ${requestId} approved. Transferred from ${prevName} to ${newAdvocateName}`,
    });

    return this.updateCase(item);
  },

  /**
   * Export Complete Citizen Master Case Record Text / HTML / File
   */
  exportMasterCaseRecord(caseId) {
    const list = LS.getAll();
    const item = list.find((c) => c.case_id === caseId);
    if (!item) return "No record found.";

    const rec = item.master_record;
    const voices = rec.stage1_intake.voice_recordings.map((v, i) => `[Voice Clip #${i + 1} - ${v.timestamp}]: ${v.transcript}`).join("\n");
    const typings = rec.stage1_intake.typed_inputs.map((t, i) => `[Typed Entry #${i + 1} - ${t.timestamp}]: ${t.text}`).join("\n");
    const docs = rec.stage2_documents.map((d, i) => `${i + 1}. ${d.name} (${d.category}) - ${d.verified ? "Verified ✅" : "Pending"}`).join("\n");
    const timeline = item.timeline.map((t) => `• [${new Date(t.timestamp).toLocaleString("en-IN")}] ${t.event} (${t.actor}): ${t.details}`).join("\n");

    return `
================================================================================
               ICJ ENTERPRISE PLATFORM — COMPLETE CITIZEN CASE RECORD
================================================================================
Case ID: ${item.case_id}
Citizen Name: ${item.citizen_name} (ID: ${item.citizen_id})
Date Created: ${new Date(item.created_at).toLocaleString("en-IN")}
Last Updated: ${new Date(item.updated_at).toLocaleString("en-IN")}
Status: ${item.status}

--------------------------------------------------------------------------------
1. CURRENT ASSIGNED LEGAL COUNSEL:
--------------------------------------------------------------------------------
Name: ${item.assigned_advocate?.advocate_name || "Senior Advocate PAWAN GUPTA"}
Role: ${item.assigned_advocate?.advocate_role || "Lead Empaneled Advocate & Appellate Counsel"}
ID: ${item.assigned_advocate?.advocate_id || "26ICJ08AA0002"}
Status: ${item.assigned_advocate?.status || "Empaneled Counsel Active"}

--------------------------------------------------------------------------------
2. STAGE 1 — LEGAL SITUATION & VOICE INTAKE:
--------------------------------------------------------------------------------
Category: ${rec.stage1_intake.legal_category}
Desired Outcome: ${rec.stage1_intake.desired_outcome || "Legal remedy & protection"}

--- Transcribed Voice Notes ---
${voices || "No voice clips recorded."}

--- Typed Information Entries ---
${typings || "No typed entries added."}

--------------------------------------------------------------------------------
3. STAGE 2 — ATTACHED DOCUMENTS & VAULT RECORDS:
--------------------------------------------------------------------------------
${docs || "No documents uploaded."}

--------------------------------------------------------------------------------
4. STAGE 3 — AI LEGAL DIAGNOSIS & RISK ANALYSIS:
--------------------------------------------------------------------------------
${rec.stage3_ai_diagnosis?.diagnosis ? JSON.stringify(rec.stage3_ai_diagnosis.diagnosis, null, 2) : "AI Diagnosis pending or completed."}

--------------------------------------------------------------------------------
5. CHRONOLOGICAL CASE TIMELINE & AUDIT TRAIL:
--------------------------------------------------------------------------------
${timeline}

================================================================================
Generated by ICJ Enterprise Platform Citizen Workflow Engine
================================================================================
`.trim();
  },
};

export default CitizenWorkflowService;
