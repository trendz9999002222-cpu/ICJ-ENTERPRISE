import { LegalEcosystemService } from "./legalEcosystemService.js";

/**
 * Consolidated LegalService
 * Forwarding to single source of truth: legalEcosystemService.js
 */
const LegalService = {
  async getAll() {
    return LegalEcosystemService.getCases();
  },

  async create(caseData = {}) {
    return LegalEcosystemService.createCase(caseData);
  },

  async update(id, values) {
    return LegalEcosystemService.updateCase(id, values);
  },

  async remove(id) {
    return LegalEcosystemService.deleteCase(id);
  },
};

export default LegalService;