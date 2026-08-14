import LegalMatterDataService from "./legalMatterDataService";

/**
 * Consolidated LegalService
 * Forwarding to single source of truth: legalMatterDataService.js
 */
const LegalService = {
  async getAll() {
    return LegalMatterDataService.getMatters();
  },

  async create(caseData = {}) {
    return LegalMatterDataService.createMatter(caseData);
  },

  async update(id, values) {
    return LegalMatterDataService.updateMatter(id, values);
  },

  async remove(id) {
    return LegalMatterDataService.deleteMatter(id);
  },
};

export default LegalService;