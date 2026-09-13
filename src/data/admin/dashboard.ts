import type { DashboardStats, RecentActivity } from "@/types/admin";

// Mock data removed — will be replaced by Django REST API
// GET /api/v1/admin/dashboard/stats/
// GET /api/v1/admin/dashboard/activity/

export const mockDashboardStats: DashboardStats = {
  totalUsers: {
    id: "total-users",
    label: "Total Users",
    value: 0,
    trend: { value: 0, direction: "up", label: "vs last month" },
    icon: "PeopleAlt",
    color: "primary",
  },
  totalAdvocates: {
    id: "total-advocates",
    label: "Verified Advocates",
    value: 0,
    trend: { value: 0, direction: "up", label: "vs last month" },
    icon: "Gavel",
    color: "success",
  },
  pendingKyc: {
    id: "pending-kyc",
    label: "Pending KYC",
    value: 0,
    trend: { value: 0, direction: "up", label: "since yesterday" },
    icon: "AssignmentInd",
    color: "warning",
  },
  activeCases: {
    id: "active-cases",
    label: "Active Cases",
    value: 0,
    trend: { value: 0, direction: "up", label: "vs last month" },
    icon: "FolderOpen",
    color: "info",
  },
  scheduledAppointments: {
    id: "scheduled-appointments",
    label: "Scheduled Appointments",
    value: 0,
    trend: { value: 0, direction: "up", label: "vs last month" },
    icon: "CalendarMonth",
    color: "secondary",
  },
  openGrievances: {
    id: "open-grievances",
    label: "Open Grievances",
    value: 0,
    trend: { value: 0, direction: "up", label: "vs last month" },
    icon: "ReportProblem",
    color: "error",
  },
};

export const mockRecentActivity: RecentActivity[] = [];
