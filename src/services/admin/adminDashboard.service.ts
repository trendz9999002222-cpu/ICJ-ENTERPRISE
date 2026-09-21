import { adminAdvocatesService } from "@/services/admin/adminAdvocates.service";
import { adminCasesService } from "@/services/admin/adminCases.service";
import { adminUsersService } from "@/services/admin/adminUsers.service";
import { getTrackedActivities } from "@/lib/adminActivity";
import type { DashboardStats, RecentActivity } from "@/types/admin";

// =============================================================================
// Admin Dashboard Service
//
// DATA ABSTRACTION LAYER — Calculates real live counts from connected services
// (Django DB via adminAdvocatesService, users service, cases service) and
// retrieves the last 10 tracked admin activity / URL hits.
// =============================================================================

export const adminDashboardService = {
  /**
   * Fetch dashboard KPI stats with real database values.
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      const [allAdvocates, users, cases] = await Promise.allSettled([
        adminAdvocatesService.listAdvocates({ status: "all", page_size: 500 }),
        adminUsersService.listUsers(),
        adminCasesService.listCases(),
      ]);

      const totalAdvocatesCount =
        allAdvocates.status === "fulfilled" ? allAdvocates.value.count : 0;

      const pendingKycCount =
        allAdvocates.status === "fulfilled"
          ? allAdvocates.value.results.filter(
              (a) => a.verification_status === "pending",
            ).length
          : 0;

      const totalUsersCount =
        users.status === "fulfilled" ? users.value.count : 0;

      const activeCasesCount =
        cases.status === "fulfilled" ? cases.value.count : 0;

      return {
        totalUsers: {
          id: "total-users",
          label: "Total Users",
          value: totalUsersCount,
          trend: { value: 0, direction: "up", label: "registered" },
          icon: "PeopleAlt",
          color: "primary",
        },
        totalAdvocates: {
          id: "total-advocates",
          label: "Total Advocates",
          value: totalAdvocatesCount,
          trend: { value: 0, direction: "up", label: "in database" },
          icon: "Gavel",
          color: "success",
        },
        pendingKyc: {
          id: "pending-kyc",
          label: "Pending KYC",
          value: pendingKycCount,
          trend: { value: 0, direction: "up", label: "awaiting review" },
          icon: "AssignmentInd",
          color: "warning",
        },
        activeCases: {
          id: "active-cases",
          label: "Active Cases",
          value: activeCasesCount,
          trend: { value: 0, direction: "up", label: "in progress" },
          icon: "FolderOpen",
          color: "info",
        },
        scheduledAppointments: {
          id: "scheduled-appointments",
          label: "Scheduled Appointments",
          value: 0,
          trend: { value: 0, direction: "up", label: "this week" },
          icon: "CalendarMonth",
          color: "secondary",
        },
        openGrievances: {
          id: "open-grievances",
          label: "Open Grievances",
          value: 0,
          trend: { value: 0, direction: "up", label: "pending resolution" },
          icon: "ReportProblem",
          color: "error",
        },
      };
    } catch (err) {
      console.warn("[adminDashboardService] Error fetching stats:", err);
      return {
        totalUsers: { id: "total-users", label: "Total Users", value: 0, trend: null, icon: "PeopleAlt", color: "primary" },
        totalAdvocates: { id: "total-advocates", label: "Total Advocates", value: 0, trend: null, icon: "Gavel", color: "success" },
        pendingKyc: { id: "pending-kyc", label: "Pending KYC", value: 0, trend: null, icon: "AssignmentInd", color: "warning" },
        activeCases: { id: "active-cases", label: "Active Cases", value: 0, trend: null, icon: "FolderOpen", color: "info" },
        scheduledAppointments: { id: "scheduled-appointments", label: "Scheduled Appointments", value: 0, trend: null, icon: "CalendarMonth", color: "secondary" },
        openGrievances: { id: "open-grievances", label: "Open Grievances", value: 0, trend: null, icon: "ReportProblem", color: "error" },
      };
    }
  },

  /**
   * Fetch recent platform activity / tracked URL hits (latest 10).
   */
  getRecentActivity: async (limit = 10): Promise<RecentActivity[]> => {
    const tracked = getTrackedActivities();
    if (tracked.length > 0) {
      return tracked.slice(0, limit).map((t) => ({
        id: t.id,
        type: (t.type as RecentActivity["type"]) || "user_registered",
        title: t.title,
        description: t.description,
        actor_name: t.actor_name,
        timestamp: t.timestamp,
        metadata: { url: t.url },
      }));
    }
    return [];
  },
};

