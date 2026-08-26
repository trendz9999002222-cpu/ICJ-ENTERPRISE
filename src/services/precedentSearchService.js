// ICJ ENTERPRISE — PRECEDENT SEARCH & CITATION SERVICE
// Powers Supreme Court & High Court Case Law Exploration, Headnotes, Ratio Decidendi & Section Cross-Linking

import { SUPREME_COURT_JUDGMENTS_MASTER, PRECEDENT_STATUS, getJudgmentsForSection } from "../data/masters/supremeCourtJudgmentsMaster.js";

export class PrecedentSearchService {
  /**
   * Search all Supreme Court & High Court precedents with filters
   */
  static searchJudgments(filters = {}) {
    let list = [...SUPREME_COURT_JUDGMENTS_MASTER];

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter((j) => {
        const inTitle = j.title.toLowerCase().includes(q);
        const inCause = j.cause_title.toLowerCase().includes(q);
        const inCitation = j.official_citation.toLowerCase().includes(q) ||
          j.parallel_citations.some((c) => c.toLowerCase().includes(q));
        const inRatio = j.ratio_decidendi_en.toLowerCase().includes(q) ||
          (j.ratio_decidendi_hi && j.ratio_decidendi_hi.includes(q));
        const inHeadnotes = j.headnotes.some((h) => h.toLowerCase().includes(q));

        return inTitle || inCause || inCitation || inRatio || inHeadnotes;
      });
    }

    if (filters.domain && filters.domain !== "ALL") {
      list = list.filter((j) => j.legal_domain === filters.domain);
    }

    if (filters.year) {
      list = list.filter((j) => j.year === Number(filters.year));
    }

    if (filters.bench && filters.bench !== "ALL") {
      list = list.filter((j) => j.bench_strength.toLowerCase().includes(filters.bench.toLowerCase()));
    }

    if (filters.status && filters.status !== "ALL") {
      list = list.filter((j) => j.precedent_status === filters.status);
    }

    return list;
  }

  /**
   * Get all judgments linked to a specific statute & section
   */
  static getJudgmentsForSection(actId, sectionNumber) {
    return getJudgmentsForSection(actId, sectionNumber);
  }

  /**
   * Format authoritative legal citation for court pleadings
   */
  static formatCourtCitation(caseObj) {
    if (!caseObj) return "";
    const parallels = caseObj.parallel_citations?.length > 0 ? ` : ${caseObj.parallel_citations[0]}` : "";
    return `${caseObj.title}, ${caseObj.official_citation}${parallels} [Decided on ${caseObj.judgment_date}]`;
  }
}

export default PrecedentSearchService;
