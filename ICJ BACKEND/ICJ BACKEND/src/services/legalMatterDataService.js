/**
 * ICJ Legal Matter Data Service — Private Matter Data Engine
 * 
 * LAYER A: Private Matter Data (member_id scoped)
 * 
 * Responsibilities:
 * 1. Matter Readiness calculation (per document type)
 * 2. Missing field detection (context-aware, not generic)
 * 3. Fact extraction from raw text with provenance tracking
 * 4. Chronology building from confirmed facts
 * 5. Placeholder detection (blocks finalization)
 * 6. Draft history persistence per member/case
 * 
 * PRIVACY RULE: All data is scoped to member_id.
 * No data crosses member boundaries.
 * No private matter data enters the global knowledge base.
 */

import { DOCUMENT_SCHEMAS, EXTRACTION_PATTERNS, DOCUMENT_CLASSIFICATION_PATTERNS } from "./legalKnowledgeBase.js";

// ─── STORAGE KEYS (all member-scoped) ────────────────────────────────────────
const MATTER_DATA_KEY = "icj_matter_intelligence_v1"; // { [memberId]: { [caseId]: matterData } }
const DRAFT_HISTORY_KEY = "icj_draft_history_v1";     // { [memberId]: { [caseId]: drafts[] } }
const EXTRACTION_LOG_KEY = "icj_extraction_log_v1";   // { [memberId]: extractionEvents[] }

// ─── UNRESOLVED PLACEHOLDER DETECTOR ─────────────────────────────────────────
const PLACEHOLDER_PATTERN = /\[([A-Z][A-Z0-9_]+)\]/g;

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const store = {
  get(key, defaultVal = {}) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultVal;
    } catch {
      return defaultVal;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (err) {
      console.error(`[MatterDataService] Storage write failed: ${key}`, err);
    }
  },
};

// ─── MATTER DATA SERVICE ──────────────────────────────────────────────────────
const LegalMatterDataService = {

  // ── BACKWARD COMPATIBILITY ALIASES ──────────────────────────────────────
  getMatters() {
    try {
      const raw = localStorage.getItem("icj_legal_cases_v2");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  createMatter(caseData = {}) { return { id: `CASE-${Date.now()}`, ...caseData }; },
  updateMatter(id, values = {}) { return { id, ...values }; },
  deleteMatter(id) { return true; },

  // ── 1. MATTER DATA CRUD (member-scoped) ──────────────────────────────────

  /** Get all matter intelligence data for a member's case */
  getMatterData(memberId, caseId) {
    const all = store.get(MATTER_DATA_KEY, {});
    return all[memberId]?.[caseId] || this._createEmptyMatterData(caseId);
  },

  /** Update matter data fields (merged, not replaced) */
  updateMatterData(memberId, caseId, updates) {
    const all = store.get(MATTER_DATA_KEY, {});
    if (!all[memberId]) all[memberId] = {};
    const existing = all[memberId][caseId] || this._createEmptyMatterData(caseId);
    all[memberId][caseId] = {
      ...existing,
      ...updates,
      fields: { ...existing.fields, ...(updates.fields || {}) },
      updatedAt: new Date().toISOString(),
    };
    store.set(MATTER_DATA_KEY, all);
    return all[memberId][caseId];
  },

  /** Confirm a specific extracted field (changes status from EXTRACTED to CONFIRMED) */
  confirmField(memberId, caseId, fieldKey, confirmedValue) {
    const all = store.get(MATTER_DATA_KEY, {});
    if (!all[memberId]) all[memberId] = {};
    const existing = all[memberId][caseId] || this._createEmptyMatterData(caseId);

    const field = existing.fields[fieldKey] || {};
    existing.fields[fieldKey] = {
      ...field,
      value: confirmedValue,
      status: "CONFIRMED",
      confirmedAt: new Date().toISOString(),
    };
    existing.updatedAt = new Date().toISOString();
    all[memberId][caseId] = existing;
    store.set(MATTER_DATA_KEY, all);
    return existing.fields[fieldKey];
  },

  /** Create empty matter data structure for a new case */
  _createEmptyMatterData(caseId) {
    return {
      caseId,
      fields: {},          // { [fieldKey]: { value, status, source, sourceDoc, extractedAt, confirmedAt } }
      chronology: [],      // [ { date, event, source, sourceDoc, legalSignificance } ]
      conflicts: [],       // [ { field, value1, source1, value2, source2 } ]
      extractedEntities: [],
      uploadedDocuments: [], // [ { id, name, type, uploadedAt, extractionStatus, extractedText } ]
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  // ── 2. MATTER READINESS ENGINE ────────────────────────────────────────────

  /**
   * Calculate Matter Readiness Score (0–100) for a given document type.
   * Returns: { score, available, missing, blocking, readyToGenerate }
   */
  calculateReadiness(memberId, caseId, caseData, docType) {
    const schema = DOCUMENT_SCHEMAS[docType];
    if (!schema) {
      return { score: 0, available: [], missing: [], blocking: [], readyToGenerate: false, error: `Unknown document type: ${docType}` };
    }

    const matterData = this.getMatterData(memberId, caseId);
    const caseFields = caseData || {};

    const available = [];
    const missing = [];
    const blocking = [];

    schema.requiredFields.forEach(({ key, label }) => {
      const matterField = matterData.fields[key];
      const caseValue = caseFields[key] || caseFields[this._mapFieldToCaseKey(key, docType)];
      const hasValue = (matterField?.status === "CONFIRMED" && matterField?.value) ||
                       (matterField?.status === "EXTRACTED" && matterField?.value) ||
                       (caseValue && String(caseValue).trim());

      if (hasValue) {
        available.push({ key, label, status: matterField?.status || "FROM_CASE", value: matterField?.value || caseValue });
      } else {
        const isBlocking = schema.blockingFields?.includes(key);
        if (isBlocking) blocking.push({ key, label, question: schema.intelligentQuestions?.[key] });
        else missing.push({ key, label, question: schema.intelligentQuestions?.[key] });
      }
    });

    const totalRequired = schema.requiredFields.length;
    const score = totalRequired > 0 ? Math.round((available.length / totalRequired) * 100) : 100;
    const threshold = schema.readinessThreshold || 70;
    const readyToGenerate = score >= threshold && blocking.length === 0;

    return { score, available, missing, blocking, readyToGenerate, threshold, docType };
  },

  /** Map abstract field keys to existing case object keys */
  _mapFieldToCaseKey(fieldKey, docType) {
    const mapping = {
      petitioner_name: "clientName",
      plaintiff_name: "clientName",
      complainant_name: "clientName",
      appellant_name: "clientName",
      applicant_name: "clientName",
      claimant_name: "clientName",
      deponent_name: "clientName",
      party1_name: "clientName",
      court_name: "court",
      appellate_court: "court",
      case_number: "caseNumber",
    };
    return mapping[fieldKey] || fieldKey;
  },

  // ── 3. DOCUMENT TEXT EXTRACTION ENGINE ───────────────────────────────────

  /**
   * Extract structured facts from raw text (from OCR, typed input, or voice).
   * Returns extracted entities with provenance. Does NOT auto-confirm — user must confirm.
   * 
   * sourceType: "USER_INPUT" | "OCR_EXTRACTED" | "VOICE_TRANSCRIBED"
   * sourceDoc: Document name or "User Input"
   */
  extractFromText(rawText, sourceType = "USER_INPUT", sourceDoc = "User Input") {
    const extracted = {
      dates: [],
      caseNumbers: [],
      amounts: [],
      parties: [],
      sections: [],
      propertyIds: [],
      firNumbers: [],
      documentType: null,
      rawText: rawText.slice(0, 5000), // Store first 5000 chars for reference
      extractedAt: new Date().toISOString(),
      sourceType,
      sourceDoc,
      confidence: "MEDIUM",
    };

    const text = rawText || "";

    // Extract dates
    const dateMatches = [...text.matchAll(EXTRACTION_PATTERNS.dates)];
    extracted.dates = [...new Set(dateMatches.map(m => m[0].trim()))].slice(0, 10);

    // Extract case numbers
    const caseMatches = [...text.matchAll(EXTRACTION_PATTERNS.caseNumbers)];
    extracted.caseNumbers = [...new Set(caseMatches.map(m => m[0].trim()))].slice(0, 5);

    // Extract amounts
    const amountMatches = [...text.matchAll(EXTRACTION_PATTERNS.amounts)];
    extracted.amounts = [...new Set(amountMatches.map(m => m[0].trim()))].slice(0, 10);

    // Extract sections
    const sectionMatches = [...text.matchAll(EXTRACTION_PATTERNS.sections)];
    extracted.sections = [...new Set(sectionMatches.map(m => m[0].trim()))].slice(0, 10);

    // Extract property identifiers
    const khasraMatches = [...text.matchAll(EXTRACTION_PATTERNS.khasraNumbers)];
    extracted.propertyIds = [...new Set(khasraMatches.map(m => m[0].trim()))].slice(0, 5);

    // Extract FIR numbers
    const firMatches = [...text.matchAll(EXTRACTION_PATTERNS.firNumbers)];
    extracted.firNumbers = [...new Set(firMatches.map(m => m[0].trim()))].slice(0, 3);

    // Auto-classify document type
    const lowerText = text.toLowerCase();
    for (const classifier of DOCUMENT_CLASSIFICATION_PATTERNS) {
      const matches = classifier.patterns.filter(p => lowerText.includes(p));
      if (matches.length >= 2) {
        extracted.documentType = classifier.type;
        break;
      }
    }

    // Extract chronology events from dates + surrounding context
    extracted.chronology = this._buildChronologyFromText(text, extracted.dates, sourceDoc);

    return extracted;
  },

  /** Build chronology entries from text context around extracted dates */
  _buildChronologyFromText(text, dates, sourceDoc) {
    const events = [];
    dates.forEach(dateStr => {
      const idx = text.indexOf(dateStr);
      if (idx >= 0) {
        const context = text.slice(Math.max(0, idx - 60), Math.min(text.length, idx + 120)).trim();
        events.push({
          date: dateStr,
          event: context.replace(dateStr, "").replace(/\n/g, " ").trim().slice(0, 200),
          source: sourceDoc,
          confidence: "EXTRACTED",
          confirmed: false,
        });
      }
    });
    return events;
  },

  /**
   * Save extraction results to a case (all fields marked as EXTRACTED, pending confirmation)
   */
  saveExtraction(memberId, caseId, extraction) {
    const all = store.get(MATTER_DATA_KEY, {});
    if (!all[memberId]) all[memberId] = {};
    const existing = all[memberId][caseId] || this._createEmptyMatterData(caseId);

    // Add uploaded document record
    const docRecord = {
      id: `doc-${Date.now()}`,
      name: extraction.sourceDoc,
      type: extraction.documentType || "Unknown",
      uploadedAt: new Date().toISOString(),
      extractionStatus: "COMPLETED",
      extractedDates: extraction.dates,
      extractedCaseNumbers: extraction.caseNumbers,
      extractedAmounts: extraction.amounts,
      extractedSections: extraction.sections,
      extractedPropertyIds: extraction.propertyIds,
      sourceType: extraction.sourceType,
    };
    existing.uploadedDocuments.push(docRecord);

    // Merge chronology (add new, don't duplicate)
    const existingDates = new Set(existing.chronology.map(c => c.date));
    extraction.chronology.forEach(ev => {
      if (!existingDates.has(ev.date)) {
        existing.chronology.push({ ...ev, docId: docRecord.id });
      }
    });

    existing.updatedAt = new Date().toISOString();
    all[memberId][caseId] = existing;
    store.set(MATTER_DATA_KEY, all);

    // Log extraction event
    const log = store.get(EXTRACTION_LOG_KEY, {});
    if (!log[memberId]) log[memberId] = [];
    log[memberId].push({
      caseId,
      docName: extraction.sourceDoc,
      sourceType: extraction.sourceType,
      extractedAt: extraction.extractedAt,
      datesFound: extraction.dates.length,
      caseNumbersFound: extraction.caseNumbers.length,
    });
    store.set(EXTRACTION_LOG_KEY, log);

    return docRecord;
  },

  // ── 4. DRAFT GENERATION GUARD ─────────────────────────────────────────────

  /**
   * Validates whether a draft can be generated.
   * Returns: { allowed, reason, missingFields, blockers }
   */
  canGenerateDraft(memberId, caseId, caseData, docType) {
    if (!caseId || caseId === "") {
      return { allowed: false, reason: "NO_CASE_SELECTED", message: "कोई केस/मैटर नहीं चुना गया। पहले Active Case File चुनें।" };
    }

    const readiness = this.calculateReadiness(memberId, caseId, caseData, docType);

    if (readiness.error) {
      return { allowed: false, reason: "UNKNOWN_TEMPLATE", message: readiness.error };
    }

    if (readiness.blocking.length > 0) {
      return {
        allowed: false,
        reason: "BLOCKING_FIELDS_MISSING",
        message: `ड्राफ्ट नहीं बन सकता — ${readiness.blocking.length} आवश्यक जानकारी अभी तक नहीं दी गई।`,
        blockers: readiness.blocking,
        readiness,
      };
    }

    if (!readiness.readyToGenerate) {
      return {
        allowed: false,
        reason: "READINESS_BELOW_THRESHOLD",
        message: `Matter Readiness ${readiness.score}% है — कम से कम ${readiness.threshold}% जानकारी आवश्यक है।`,
        readiness,
        missing: readiness.missing,
      };
    }

    return { allowed: true, readiness };
  },

  /**
   * Check generated draft text for unresolved placeholders.
   * Returns: { clean, placeholders }
   */
  checkPlaceholders(draftText) {
    const matches = [...(draftText || "").matchAll(PLACEHOLDER_PATTERN)];
    const placeholders = [...new Set(matches.map(m => m[0]))];
    return {
      clean: placeholders.length === 0,
      placeholders,
      count: placeholders.length,
    };
  },

  // ── 5. DRAFT HISTORY (member + case scoped) ───────────────────────────────

  getDraftHistory(memberId, caseId) {
    const all = store.get(DRAFT_HISTORY_KEY, {});
    return all[memberId]?.[caseId] || [];
  },

  saveDraft(memberId, caseId, draftRecord) {
    const all = store.get(DRAFT_HISTORY_KEY, {});
    if (!all[memberId]) all[memberId] = {};
    if (!all[memberId][caseId]) all[memberId][caseId] = [];
    all[memberId][caseId].unshift(draftRecord);
    store.set(DRAFT_HISTORY_KEY, all);
    return draftRecord;
  },

  getAllDraftsForMember(memberId) {
    const all = store.get(DRAFT_HISTORY_KEY, {});
    const memberDrafts = all[memberId] || {};
    return Object.values(memberDrafts).flat();
  },

  // ── 6. CONFLICT DETECTION ─────────────────────────────────────────────────

  /** Detect conflicts between two extractions for the same field */
  detectConflicts(memberId, caseId, newExtraction) {
    const matterData = this.getMatterData(memberId, caseId);
    const conflicts = [];

    // Check if extracted dates conflict with confirmed dates in matter
    newExtraction.dates?.forEach(newDate => {
      matterData.chronology?.forEach(existing => {
        if (existing.confirmed && existing.date !== newDate &&
            this._datesRoughlyEqual(existing.date, newDate)) {
          conflicts.push({
            field: "date",
            value1: existing.date,
            source1: existing.source,
            value2: newDate,
            source2: newExtraction.sourceDoc,
            flaggedAt: new Date().toISOString(),
          });
        }
      });
    });

    return conflicts;
  },

  _datesRoughlyEqual(d1, d2) {
    // Simple check — normalize and compare
    const clean = (d) => d.replace(/[-/\.]/g, "").trim();
    return clean(d1) === clean(d2);
  },

  // ── 7. INTELLIGENT QUESTIONS (context-aware, NOT generic) ─────────────────

  /**
   * Returns only the questions relevant to the current docType and missing fields.
   * NOT a generic questionnaire.
   */
  getIntelligentQuestions(memberId, caseId, caseData, docType) {
    const readiness = this.calculateReadiness(memberId, caseId, caseData, docType);
    const schema = DOCUMENT_SCHEMAS[docType];
    if (!schema) return [];

    const questions = [];

    // Blocking fields first
    readiness.blocking?.forEach(({ key, label, question }) => {
      questions.push({
        fieldKey: key,
        label,
        question: question || `Please provide: ${label}`,
        priority: "REQUIRED",
        isBlocking: true,
        inputType: schema.requiredFields.find(f => f.key === key)?.type || "text",
      });
    });

    // Then missing non-blocking required fields
    readiness.missing?.forEach(({ key, label, question }) => {
      questions.push({
        fieldKey: key,
        label,
        question: question || `Please provide: ${label}`,
        priority: "IMPORTANT",
        isBlocking: false,
        inputType: schema.requiredFields.find(f => f.key === key)?.type || "text",
      });
    });

    return questions;
  },

  // ── 8. DOCUMENT REQUIREMENTS ──────────────────────────────────────────────

  getDocumentRequirements(docType) {
    return DOCUMENT_SCHEMAS[docType]?.documentRequirements || [];
  },
};

export default LegalMatterDataService;
