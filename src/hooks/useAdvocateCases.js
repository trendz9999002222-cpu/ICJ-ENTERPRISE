/**
 * useAdvocateCases — ICJ Enterprise Platform
 *
 * Data hook for AdvocateDashboard.
 * Centralizes all case/advocate/consultation loading.
 * - कभी undefined array नहीं देगा
 * - हर array guaranteed [] default है
 */
import { useState, useEffect, useMemo } from "react";
import LegalEcosystemService from "../services/legalEcosystemService.js";
import AiLegalConsultationService from "../services/aiLegalConsultationService.js";

export function useAdvocateCases(userId = "") {
  const [cases, setCases] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [aiConsultations, setAiConsultations] = useState([]);
  const [activeAdvocateCaseId, setActiveAdvocateCaseId] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    try {
      const allCases = LegalEcosystemService.getCases() || [];
      const allAdvocates = LegalEcosystemService.getAdvocates() || [];
      const allConsultations =
        AiLegalConsultationService.getConsultationsForAdvocate
          ? AiLegalConsultationService.getConsultationsForAdvocate(userId) || []
          : [];

      if (active) {
        const casesList = Array.isArray(allCases) ? allCases : [];
        setCases(casesList);
        setAdvocates(Array.isArray(allAdvocates) ? allAdvocates : []);
        setAiConsultations(Array.isArray(allConsultations) ? allConsultations : []);
        if (casesList.length > 0) {
          setActiveAdvocateCaseId(casesList[0].id || casesList[0].caseNumber || "");
        }
      }
    } catch {
      // Keep empty defaults on any service error
    }
    return () => { active = false; };
  }, [userId]);

  const filteredCases = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cases;
    return cases.filter((c) =>
      [c.id, c.caseNumber, c.title, c.clientName, c.advocateName, c.courtName, c.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [cases, search]);

  const clients = useMemo(() => {
    const map = new Map();
    cases.forEach((c, idx) => {
      if (c.clientName && !map.has(c.clientName)) {
        map.set(c.clientName, {
          id: `CL-REC-${idx + 101}`,
          name: c.clientName,
          type: c.courtName?.includes("High Court") ? "NGO / Trust" : "Corporate",
          status: "Active",
          mobile: c.clientPhone || c.phone || "N/A",
          email: c.clientEmail || `${c.clientName.toLowerCase().replace(/[^a-z0-9]/g, "")}@client.icj.org`,
          region: c.courtName || "High Court Jurisdiction",
        });
      }
    });
    return Array.from(map.values());
  }, [cases]);

  return {
    cases,
    setCases,
    filteredCases,
    clients,
    advocates,
    setAdvocates,
    aiConsultations,
    setAiConsultations,
    activeAdvocateCaseId,
    setActiveAdvocateCaseId,
    search,
    setSearch,
  };
}

export default useAdvocateCases;
