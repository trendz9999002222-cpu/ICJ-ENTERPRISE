import { getMembers } from "./database";
import { getWallets } from "./database";
import { getTokens } from "./database";
import { getDonations } from "./database";
import { getLegalCases } from "./database";
import { getDocuments } from "./database";
import DocumentService from "./documentService";
import FinanceService from "./financeService";
import NotificationService from "./notificationService";
import OrganizationService from "./organizationService";
import WorkflowService from "./workflowService";
import { MemberService } from "./memberService";

const DashboardService = {

  async getStatistics() {
    const [members, wallets, tokens, donations, legalCases, documents] =
      await Promise.all([
        getMembers(),
        getWallets(),
        getTokens(),
        getDonations(),
        getLegalCases(),
        getDocuments(),
      ]);

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

    const memberStats = await MemberService.getStatistics();
    const memberRows = Array.isArray(members) ? members : [];
    const pendingApprovals = Number(memberStats.pendingMembers || 0);
    const pendingVerification = memberRows.filter((item) => {
      const value = String(item?.verification_status || "").trim().toUpperCase();
      return !value || value === "NOT VERIFIED" || value === "PENDING" || value === "UNDER VERIFICATION";
    }).length;

    return {

      totalMembers: Number(memberStats.totalMembers || 0),

      totalWallets: wallets.length,

      totalTokens: tokens.length,

      totalDonations: donations.length,

      totalLegalCases: legalCases.length,

      totalDocuments: documents.length,

      donationAmount,

      walletBalance,

      tokenAmount,

      pendingApprovals,

      pendingVerification,

      lastUpdated: new Date().toISOString(),

    };

  },

  async getRecentMembers(limit = 5) {
    const rows = await getMembers();
    return (Array.isArray(rows) ? rows : [])
      .slice()
      .sort((a, b) => {
        const left = new Date(b?.registration_date || b?.created_at || 0).getTime();
        const right = new Date(a?.registration_date || a?.created_at || 0).getTime();
        return left - right;
      })
      .slice(0, Math.max(1, Number(limit || 5)));
  },

  async getRecentActivities(limit = 5) {
    const recentMembers = await this.getRecentMembers(limit);
    return recentMembers.map((member) => ({
      id: member?.id || member?.member_id || String(Math.random()),
      type: "Member",
      title: "Member registered",
      user: member?.name || member?.full_name || member?.email || "Member",
      time: member?.registration_date || member?.created_at || null,
    }));
  },

  async getNotifications() {
    const stats = await this.getStatistics();
    return [
      {
        id: 1,
        title: `${stats.pendingApprovals} memberships pending approval`,
        priority: "High",
      },
      {
        id: 2,
        title: `${stats.pendingVerification} memberships pending verification`,
        priority: "Medium",
      },
    ];
  },

};
// ================================
// Dashboard Analytics Module
// ================================

DashboardService.getAnalytics = async () => {
  return Promise.resolve({
    overview: {
      totalMembers: 1250,
      activeMembers: 1180,
      pendingMembers: 70,

      totalDonation: 1250000,
      monthlyDonation: 165000,

      walletBalance: 845000,
      tokenBalance: 450000,

      legalCases: 82,
      activeCases: 27,
      completedCases: 55,

      documents: 2860,
      certificates: 1520,

      aiRequests: 3260,
      notifications: 42
    },

    charts: {
      monthlyDonation: [
        12000,
        24000,
        35000,
        42000,
        65000,
        91000,
        125000,
        154000,
        178000,
        195000,
        230000,
        265000
      ],

      memberGrowth: [
        35,
        52,
        70,
        91,
        110,
        140,
        180,
        220,
        280,
        360,
        420,
        500
      ]
    },

    systemHealth: {
      server: "Healthy",
      database: "Connected",
      storage: "72%",
      cpu: "34%",
      memory: "46%",
      api: "Running"
    }
  });
};

// ======================================
// Dashboard Reports
// ======================================

DashboardService.getReports = async () => {
  return Promise.resolve({
    today: {
      members: 12,
      donations: 25000,
      documents: 18,
      legalCases: 3
    },

    monthly: {
      members: 245,
      donations: 1250000,
      documents: 540,
      legalCases: 42
    },

    yearly: {
      members: 2840,
      donations: 18500000,
      documents: 6800,
      legalCases: 410
    }
  });
};

// ======================================
// Dashboard Performance
// ======================================

DashboardService.getPerformance = async () => {
  return Promise.resolve({
    serverLoad: 34,
    apiResponse: "120 ms",
    databaseSpeed: "Excellent",
    storageUsed: "72%",
    backupStatus: "Completed",
    security: "Protected",
    uptime: "99.98%"
  });
};

// ======================================
// Dashboard Quick Summary
// ======================================

DashboardService.getQuickSummary = async () => {
  return Promise.resolve({
    pendingApprovals: 5,
    unreadNotifications: 4,
    activeUsers: 148,
    onlineAdmins: 3,
    totalTransactions: 8420,
    aiRequestsToday: 267
  });
};

DashboardService.getOrganizationDashboard = async (organizationId = "") => {
  if (!organizationId) {
    return {
      organization: null,
      totalMembers: 0,
      activeMembers: 0,
      roleDistribution: {},
      branches: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  return OrganizationService.getOrganizationDashboard(organizationId);
};

DashboardService.getFinanceDashboard = async (filters = {}, role = "member", actorProfile = null) => {
  return FinanceService.getDashboard(filters, role, actorProfile);
};

DashboardService.getDocumentDashboard = async (filters = {}) => {
  return DocumentService.getDashboard(filters);
};

DashboardService.getWorkflowDashboard = async (filters = {}, role = "member", actor = {}) => {
  return WorkflowService.getDashboard(filters, role, actor);
};

DashboardService.getNotificationDashboard = async (filters = {}, role = "member") => {
  return NotificationService.getDashboard(filters, role);
};

export default DashboardService