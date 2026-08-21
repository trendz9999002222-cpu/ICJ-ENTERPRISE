/**
 * useActiveConsultation — ICJ Enterprise Platform
 *
 * Component-safe hook: always returns a valid consultation object.
 * - कभी undefined नहीं होगा
 * - aiConsultations state change पर auto-update
 * - Default fallback built-in
 */
import { useState, useEffect } from "react";

const DEFAULT_CONSULTATION = {
  consultationId: "ICJ-2026-INTAKE-LIVE",
  clientName: "Empaneled Litigant Member",
  caseCategory: "Property & Land Dispute",
  problemText: "",
  diagnosis: {
    legalStand: "Pending AI Diagnosis.",
    sectionsApplicable: ["Land Revenue Code Sec 24", "Specific Relief Act Sec 38", "CPC Order 39 Rule 1 & 2"],
  },
};

const LS_KEY = "icj_ai_legal_consultations";

function readConsultationFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_CONSULTATION;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    return DEFAULT_CONSULTATION;
  } catch {
    return DEFAULT_CONSULTATION;
  }
}

/**
 * useActiveConsultation(aiConsultations?)
 *
 * @param {Array} [aiConsultations] — optional: pass aiConsultations state to
 *   trigger re-read when it changes (e.g. after Sync button click).
 *
 * @returns {{ activeConsultation, setActiveConsultation }}
 */
export function useActiveConsultation(aiConsultations = []) {
  const [activeConsultation, setActiveConsultation] = useState(readConsultationFromStorage);

  // Re-sync whenever aiConsultations changes (e.g. Sync Live Session button)
  useEffect(() => {
    const latest = readConsultationFromStorage();
    setActiveConsultation(latest);
  }, [aiConsultations]);

  // Persist updates back to localStorage
  const updateActiveConsultation = (updater) => {
    setActiveConsultation((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem(LS_KEY, JSON.stringify([next]));
      } catch {}
      return next;
    });
  };

  return { activeConsultation, setActiveConsultation: updateActiveConsultation };
}

export default useActiveConsultation;
