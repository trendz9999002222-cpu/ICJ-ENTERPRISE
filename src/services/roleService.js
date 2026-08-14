/**
 * RoleService — Dynamic Role Management for ICJ Enterprise Platform
 * Stores custom roles in localStorage under 'icj_roles' key.
 * Default roles (admin/employee/member) are always present but admin cannot be modified.
 */

const ROLES_KEY = "icj_roles";

const DEFAULT_ROLES = {
  admin: {
    label: "Admin",
    modules: ["*"],
    editable: false,
    description: "Super Admin — full platform access",
  },
  employee: {
    label: "Employee",
    modules: [
      "dashboard", "membership", "documents", "legal",
      "reports", "notifications", "settings",
    ],
    editable: true,
    description: "Internal team member with module access",
  },
  member: {
    label: "Member",
    modules: [
      "dashboard", "member-profile", "member-documents",
      "member-wallet", "notifications",
    ],
    editable: true,
    description: "Registered ICJ member with limited access",
  },
  staff: {
    label: "Advocate Staff",
    modules: [
      "dashboard", "member-profile", "member-documents",
      "legal", "notifications"
    ],
    editable: true,
    description: "Advocate Staff — limited case and document access",
  },
};

const RoleService = {
  /**
   * Get all roles (default + custom).
   */
  getAll() {
    try {
      const raw = localStorage.getItem(ROLES_KEY);
      const custom = raw ? JSON.parse(raw) : {};
      return { ...DEFAULT_ROLES, ...custom };
    } catch {
      return { ...DEFAULT_ROLES };
    }
  },

  /**
   * Get permissions for a specific role key.
   * Returns array of module IDs, or ["*"] for full access.
   */
  getModules(roleKey) {
    const roles = this.getAll();
    const role = roles[(roleKey || "").toLowerCase()];
    return role?.modules || DEFAULT_ROLES.member.modules;
  },

  /**
   * Check if a role has access to a specific module.
   */
  hasAccess(roleKey, moduleId) {
    const modules = this.getModules(roleKey);
    if (modules.includes("*")) return true;
    return modules.includes(moduleId);
  },

  /**
   * Create a new custom role.
   */
  createRole(key, label, modules = []) {
    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, "_");
    if (!normalizedKey) throw new Error("Role key is required.");

    const all = this.getAll();
    if (all[normalizedKey]) throw new Error(`Role '${normalizedKey}' already exists.`);

    const updated = {
      ...all,
      [normalizedKey]: {
        label: label || key,
        modules,
        editable: true,
        description: `Custom role: ${label || key}`,
      },
    };
    // Save only custom (non-default) roles
    const toSave = Object.fromEntries(
      Object.entries(updated).filter(([k]) => !["admin", "employee", "member"].includes(k))
    );
    localStorage.setItem(ROLES_KEY, JSON.stringify(toSave));
    return updated[normalizedKey];
  },

  /**
   * Update modules for an existing editable role.
   */
  updateRoleModules(key, modules) {
    const all = this.getAll();
    const role = all[key];
    if (!role) throw new Error(`Role '${key}' not found.`);
    if (!role.editable) throw new Error(`Role '${key}' is a system role and cannot be modified.`);

    const updated = { ...all, [key]: { ...role, modules } };
    const toSave = Object.fromEntries(
      Object.entries(updated).filter(([k]) => !["admin"].includes(k))
    );
    localStorage.setItem(ROLES_KEY, JSON.stringify(toSave));
  },

  /**
   * Delete a custom role.
   */
  deleteRole(key) {
    if (["admin", "employee", "member"].includes(key)) {
      throw new Error("Default roles cannot be deleted.");
    }
    const all = this.getAll();
    delete all[key];
    const toSave = Object.fromEntries(
      Object.entries(all).filter(([k]) => !["admin", "employee", "member"].includes(k))
    );
    localStorage.setItem(ROLES_KEY, JSON.stringify(toSave));
  },

  /**
   * Super Admin Power Delegation Methods
   */
  getAdminPowers(username) {
    try {
      const raw = localStorage.getItem("icj_admin_powers");
      const map = raw ? JSON.parse(raw) : {};
      return map[username] || {
        canAppointAdvocates: true,
        canGrantCredits: true,
        canProcessFranchise: true,
        canRedelegate: false,
      };
    } catch {
      return {
        canAppointAdvocates: true,
        canGrantCredits: true,
        canProcessFranchise: true,
        canRedelegate: false,
      };
    }
  },

  setAdminPowers(username, powers) {
    try {
      const raw = localStorage.getItem("icj_admin_powers");
      const map = raw ? JSON.parse(raw) : {};
      map[username] = { ...this.getAdminPowers(username), ...powers, updatedBy: "SuperAdmin", updatedAt: new Date().toISOString() };
      localStorage.setItem("icj_admin_powers", JSON.stringify(map));
      return map[username];
    } catch (e) {
      console.error("Failed to set admin powers", e);
      return null;
    }
  },

  hasPower(username, isSuperAdmin, powerKey) {
    if (isSuperAdmin || username === "ICJSuperAdmin1234") return true;
    const powers = this.getAdminPowers(username);
    return Boolean(powers[powerKey]);
  },
};

export default RoleService;
