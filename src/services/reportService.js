import {
  getReports,
  addReport,
} from "./database";

const ReportService = {

  async getAll() {
    return await getReports();
  },

  async create(reportData = {}) {

    const report = {
      id: Date.now(),
      reportNo: "RPT-" + Date.now(),
      title: reportData.title || "",
      category: reportData.category || "",
      description: reportData.description || "",
      createdBy: reportData.createdBy || "",
      status: reportData.status || "Generated",
      createdAt: new Date().toISOString(),
      ...reportData,
    };

    return await addReport(report);
  },

};

export default ReportService;
