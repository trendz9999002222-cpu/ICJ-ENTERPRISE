const normalizeRole = (role) => String(role || "member").toLowerCase();

const PERMISSIONS = {
  admin: {
    canUseAI: true,
    canManageSettings: true,
    canManagePrompts: true,
    canViewLogs: true,
    canViewHistory: true,
    canManageProviders: true,
    moduleAccess: [
      "membership",
      "finance",
      "wallet",
      "token",
      "legal",
      "documents",
      "reports",
      "dashboard",
    ],
  },
  employee: {
    canUseAI: true,
    canManageSettings: false,
    canManagePrompts: true,
    canViewLogs: true,
    canViewHistory: true,
    canManageProviders: false,
    moduleAccess: [
      "membership",
      "finance",
      "wallet",
      "token",
      "legal",
      "documents",
      "reports",
      "dashboard",
    ],
  },
  member: {
    canUseAI: false,
    canManageSettings: false,
    canManagePrompts: false,
    canViewLogs: false,
    canViewHistory: false,
    canManageProviders: false,
    moduleAccess: ["membership", "wallet", "documents", "dashboard"],
  },
};

const AIPermissionService = {
  get(role) {
    return PERMISSIONS[normalizeRole(role)] || PERMISSIONS.member;
  },

  canAccessModule(role, moduleId) {
    const permissions = this.get(role);
    return permissions.moduleAccess.includes(String(moduleId || ""));
  },
};

export default AIPermissionService;
