/**
 * SeedEcosystemService — ICJ Enterprise Platform
 * Master Single Super Admin Ecosystem Registry & Auto-Hydration Engine.
 *
 * Active Role:
 * - 1 Super Admin (ICJSuperAdmin1234)
 */

import { ENTERPRISE_SEED_USERS } from "../data/seedUsers.js";

export const MASTER_SEED_MEMBERS = ENTERPRISE_SEED_USERS;
export const MASTER_26_SEED_MEMBERS = ENTERPRISE_SEED_USERS;

export const DEFAULT_SEED_PASSWORD = "ICJSuperAdmin1234";

export const SeedEcosystemService = {
  /**
   * Reset and Hydrate strictly the 1 Super Admin account
   */
  resetAndHydrate26CoreMembers() {
    const members = ENTERPRISE_SEED_USERS;
    if (typeof window === "undefined" || !window.localStorage) return members;

    window.localStorage.setItem("icj_members", JSON.stringify(members));
    window.localStorage.setItem("icj_enterprise_users", JSON.stringify(members));
    window.localStorage.setItem("icj_users_initialized", "true");
    window.localStorage.setItem("icj_purge_version", "2026_V2_SUPER_ADMIN_ONLY");
    console.log("⚡ [SeedEcosystemService] Single Super Admin Ecosystem Hydrated Cleanly!");
    return members;
  },

  /**
   * Get core master members
   */
  get26CoreMembers() {
    if (typeof window === "undefined" || !window.localStorage) return ENTERPRISE_SEED_USERS;
    try {
      const purgeVer = window.localStorage.getItem("icj_purge_version");
      if (purgeVer !== "2026_V2_SUPER_ADMIN_ONLY") {
        return this.resetAndHydrate26CoreMembers();
      }
      const local = JSON.parse(window.localStorage.getItem("icj_members") || "[]");
      if (Array.isArray(local) && local.length > 0) return local;
      return this.resetAndHydrate26CoreMembers();
    } catch {
      return this.resetAndHydrate26CoreMembers();
    }
  },

  /**
   * Purge old stale dummy data and reset cleanly
   */
  purgeAndResetCleanEcosystem() {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      window.localStorage.removeItem("icj_users_initialized");
      window.localStorage.removeItem("icj_purge_version");
      return this.resetAndHydrate26CoreMembers();
    } catch (e) {
      console.error("Purge error", e);
    }
  }
};

export default SeedEcosystemService;
