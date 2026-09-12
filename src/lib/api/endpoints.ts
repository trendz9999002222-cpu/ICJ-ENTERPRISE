export const API_ENDPOINTS = {
  health: "/health/",
  auth: {
    login: "/auth/login/",
    refresh: "/auth/refresh/",
    register: "/auth/register/",
    me: "/auth/me/",
    changePassword: "/auth/change-password/",
  },
  members: "/members/",
  onboarding: {
    advocateSubmit: "/onboarding/advocate/",
    adminAdvocates: "/onboarding/admin/advocates/",
    adminAdvocateDetail: (id: string) => `/onboarding/admin/advocates/${id}/`,
    adminAdvocateApprove: (id: string) => `/onboarding/admin/advocates/${id}/approve/`,
    adminAdvocateReject: (id: string) => `/onboarding/admin/advocates/${id}/reject/`,
  },
} as const;
