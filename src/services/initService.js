import AuthService from "./authService.js";
import { getNotifications, addNotification } from "./database.js";

export const DEFAULT_SUPER_ADMIN = {
  id: "super_admin_001",
  email: "admin@icj.org",
  fullName: "Super Admin",
  role: "admin",
};

export const DEFAULT_ROLES = ["admin", "employee", "member"];

export const DEFAULT_PERMISSIONS = {
  admin: ["*"],
  employee: [
    "dashboard",
    "membership",
    "documents",
    "legal",
    "finance",
    "notifications",
    "reports",
    "settings",
  ],
  member: [
    "dashboard",
    "member-profile",
    "member-documents",
    "member-wallet",
    "notifications",
  ],
};

export const InitService = {
  async ensureSuperAdmin() {
    const currentUser = await AuthService.getCurrentUser();
    return currentUser;
  },

  async initializeSystem() {
    const admin = await this.ensureSuperAdmin();

    const notifications = await getNotifications();
    const isInitialized = notifications.some((n) => n.title === "System Initialized");

    if (!isInitialized) {
      await addNotification({
        title: "System Initialized",
        message: "ICJ Enterprise Platform initialized with secure Super Admin account.",
        type: "System",
        status: "Unread",
      });
    }

    return {
      initialized: true,
      superAdmin: admin?.email || "admin@icj.org",
      roles: DEFAULT_ROLES,
      permissions: DEFAULT_PERMISSIONS,
    };
  },
};

export default InitService;
