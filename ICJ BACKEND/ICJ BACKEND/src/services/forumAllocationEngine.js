import { JUDICIAL_FORUMS } from "./judiciaryMasterService.js";

export const ForumAllocationEngine = {
  /**
   * Smart Auto-Map Court Name / Bar Registration Text to 10 Judicial Forum Ranks
   * Example: "Allahabad High Court Lucknow Bench" -> Rank 2 (High Court)
   * Example: "Sadar Tehsil & SDM Court" -> Rank 4 (Tehsil / SDM)
   */
  autoDetectForum(courtNameText = "") {
    const text = String(courtNameText || "").toLowerCase();

    if (text.includes("supreme court") || text.includes("apex court") || text.includes("sc india")) {
      return JUDICIAL_FORUMS.find((f) => f.id === "SUPREME_COURT");
    }
    if (text.includes("high court") || text.includes("hc bench") || text.includes("hc lucknow") || text.includes("hc allahabad")) {
      return JUDICIAL_FORUMS.find((f) => f.id === "HIGH_COURT");
    }
    if (text.includes("tehsil") || text.includes("sdm") || text.includes("executive magistrate") || text.includes("revenue court")) {
      return JUDICIAL_FORUMS.find((f) => f.id === "TEHSIL_SDM");
    }
    if (text.includes("nclt") || text.includes("nclat") || text.includes("company law")) {
      return JUDICIAL_FORUMS.find((f) => f.id === "NCLT_NCLAT");
    }
    if (text.includes("ngt") || text.includes("green tribunal") || text.includes("environment")) {
      return JUDICIAL_FORUMS.find((f) => f.id === "NGT");
    }
    if (text.includes("drt") || text.includes("drat") || text.includes("debt recovery") || text.includes("sarfaesi")) {
      return JUDICIAL_FORUMS.find((f) => f.id === "DRT_DRAT");
    }
    if (text.includes("rera") || text.includes("consumer") || text.includes("forum")) {
      return JUDICIAL_FORUMS.find((f) => f.id === "RERA_CONSUMER");
    }
    if (text.includes("cat") || text.includes("administrative tribunal") || text.includes("service tribunal")) {
      return JUDICIAL_FORUMS.find((f) => f.id === "CAT");
    }
    if (text.includes("labour") || text.includes("industrial") || text.includes("workmen")) {
      return JUDICIAL_FORUMS.find((f) => f.id === "LABOUR_COURT");
    }

    // Default to District & Sessions Court (Rank 3)
    return JUDICIAL_FORUMS.find((f) => f.id === "DISTRICT_COURT");
  },
};

export default ForumAllocationEngine;
