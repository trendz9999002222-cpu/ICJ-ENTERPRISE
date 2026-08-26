// ICJ ENTERPRISE — PAN-INDIA 25 HIGH COURTS PRECEDENT & CITATION SERVICE
// Powers Neutral Citation Searches (e.g. 2024:DHC:1520, 2023:AHC:9210), State HC Benches & Section Cross-Linking

import { ALL_INDIA_25_HIGH_COURTS, getHighCourtByCode } from "../data/masters/highCourtsMasterRegistry.js";
import { HIGH_COURT_JUDGMENTS_STORE, getHighCourtJudgmentsForSection } from "../data/masters/highCourtsJudgmentsStore.js";

export class HighCourtPrecedentService {
  /**
   * Get all 25 registered High Courts in India
   */
  static getAllHighCourts() {
    return ALL_INDIA_25_HIGH_COURTS;
  }

  /**
   * Get High Court Metadata by code (e.g. "DHC", "AHC", "BHC")
   */
  static getHighCourtMeta(hcCode) {
    return getHighCourtByCode(hcCode);
  }

  /**
   * Search High Court Judgments with dynamic multi-dimensional filters
   */
  static searchHighCourtJudgments(filters = {}) {
    let list = [...HIGH_COURT_JUDGMENTS_STORE];

    if (filters.hc_code && filters.hc_code !== "ALL") {
      list = list.filter((j) => j.hc_code === filters.hc_code);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter((j) => {
        const inTitle = j.title.toLowerCase().includes(q);
        const inCause = j.cause_title.toLowerCase().includes(q);
        const inCitation = j.neutral_citation.toLowerCase().includes(q) ||
          (j.parallel_citation && j.parallel_citation.toLowerCase().includes(q));
        const inCaseNo = j.case_number.toLowerCase().includes(q);
        const inRatio = j.ratio_decidendi_en.toLowerCase().includes(q) ||
          (j.ratio_decidendi_hi && j.ratio_decidendi_hi.includes(q));
        const inHeadnotes = j.headnotes?.some((h) => h.toLowerCase().includes(q));

        return inTitle || inCause || inCitation || inCaseNo || inRatio || inHeadnotes;
      });
    }

    if (filters.domain && filters.domain !== "ALL") {
      list = list.filter((j) => j.legal_domain === filters.domain);
    }

    if (filters.year) {
      list = list.filter((j) => j.year === Number(filters.year));
    }

    return list;
  }

  /**
   * Get High Court Judgments linked to a specific statute section
   */
  static getJudgmentsForSection(actId, sectionNumber, hcCode = null) {
    return getHighCourtJudgmentsForSection(actId, sectionNumber, hcCode);
  }

  /**
   * Format official High Court Citation for court pleadings
   */
  static formatHighCourtCitation(caseObj) {
    if (!caseObj) return "";
    const hcMeta = getHighCourtByCode(caseObj.hc_code);
    const hcName = hcMeta ? hcMeta.name_en : caseObj.court_name;
    return `${caseObj.title}, ${caseObj.neutral_citation} [${hcName}, ${caseObj.bench_location}] (Decided on ${caseObj.judgment_date})`;
  }
}

export default HighCourtPrecedentService;
