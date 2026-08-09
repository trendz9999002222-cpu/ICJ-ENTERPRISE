import { getMembers } from "./database.js";
import { getWallets } from "./database.js";
import { getTokens } from "./database.js";
import { getDonations } from "./database.js";
import { getLegalCases } from "./database.js";
import { getDocuments } from "./database.js";
import { getReports } from "./database.js";

const DashboardService = {

  async getStatistics() {
    const [members, wallets, tokens, donations, legalCases, documents, reports] =
      await Promise.all([
        getMembers(),
        getWallets(),
        getTokens(),
        getDonations(),
        getLegalCases(),
        getDocuments(),
        getReports().catch(() => []),
      ]);

    const safeMembers = Array.isArray(members) ? members : [];

    const donationAmount = (donations || []).reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const walletBalance = (wallets || []).reduce(
      (sum, item) => sum + Number(item.balance || 0),
      0
    );

    const tokenAmount = (tokens || []).reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const verifiedMembers = safeMembers.filter(
      (m) => (m.verification_status || "").toLowerCase() === "verified"
    ).length;

    const pendingMembers = safeMembers.filter(
      (m) => !m.verification_status || (m.verification_status || "").toLowerCase() === "pending"
    ).length;

    const rejectedMembers = safeMembers.filter(
      (m) => (m.verification_status || "").toLowerCase() === "rejected"
    ).length;

    const suspendedMembers = safeMembers.filter(
      (m) => (m.verification_status || "").toLowerCase() === "suspended"
    ).length;

    const activeMembers = safeMembers.filter(
      (m) =>
        (m.status || "").toLowerCase() === "active" ||
        (m.verification_status || "").toLowerCase() === "verified"
    ).length;

    return {

      totalMembers: safeMembers.length,

      verifiedMembers,

      pendingMembers,

      rejectedMembers,

      suspendedMembers,

      activeMembers,

      totalWallets: wallets.length,

      totalTokens: tokens.length,

      totalDonations: donations.length,

      totalLegalCases: legalCases.length,

      totalDocuments: documents.length,

      totalReports: Array.isArray(reports) ? reports.length : 0,

      donationAmount,

      walletBalance,

      tokenAmount,

      lastUpdated: new Date().toISOString(),

    };

  },

};

export default DashboardService;