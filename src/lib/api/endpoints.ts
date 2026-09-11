export const API_ENDPOINTS = {
  health: "/health/",
  auth: {
    login: "/auth/login/",
    refresh: "/auth/refresh/",
    register: "/auth/register/",
    me: "/auth/me/",
  },
  members: "/members/",
} as const;
