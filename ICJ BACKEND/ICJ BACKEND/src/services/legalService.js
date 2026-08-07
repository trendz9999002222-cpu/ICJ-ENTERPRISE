import {
  getLegalCases,
  addLegalCase,
  updateLegalCase,
  deleteLegalCase,
} from "./database";

const LegalService = {

  async getAll() {
    return await getLegalCases();
  },

  async create(caseData = {}) {

    const legalCase = {
      id: Date.now(),
      caseNumber: "CASE-" + Date.now(),
      title: caseData.title || "",
      clientName: caseData.clientName || "",
      advocateName: caseData.advocateName || "",
      courtName: caseData.courtName || "",
      status: caseData.status || "Pending",
      nextHearing: caseData.nextHearing || "",
      createdAt: new Date().toISOString(),
      ...caseData,
    };

    return await addLegalCase(legalCase);
  },

  async update(id, values) {
    await updateLegalCase(id, values);
  },

  async remove(id) {
    await deleteLegalCase(id);
  },

};

export default LegalService;