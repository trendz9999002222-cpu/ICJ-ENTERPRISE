/**
 * SeedEcosystemService — ICJ Enterprise Platform
 * Master Clean 7-Member Ecosystem Registry & Auto-Hydration Engine.
 *
 * Clean Testing Roles:
 * - 1 Super Admin (ICJSuperAdmin1234)
 * - 1 Operations Admin (ICJAdmin1234)
 * - 2 Senior Advocates (Adv. Vikramaditya Rao, Adv. Ananya Sharma)
 * - 2 Litigant Clients (Ramesh Kumar Gupta, Sunita Devi)
 * - 1 Legal Entity / Trust (Green Earth Legal Trust)
 */

import { hashPasswordSync } from "./passwordPolicyService.js";
import { ENTERPRISE_SEED_USERS } from "../data/seedUsers.js";

export const MASTER_SEED_MEMBERS = ENTERPRISE_SEED_USERS;
export const MASTER_26_SEED_MEMBERS = ENTERPRISE_SEED_USERS;

export const DEFAULT_SEED_PASSWORD = "IcjBeta@2026";

export const SeedEcosystemService = {
  /**
   * Reset and Hydrate the lean 7-member core ecosystem
   */
  resetAndHydrate26CoreMembers() {
    const members = ENTERPRISE_SEED_USERS;
    if (typeof window === "undefined" || !window.localStorage) return members;

    window.localStorage.setItem("icj_members", JSON.stringify(members));
    window.localStorage.setItem("icj_enterprise_users", JSON.stringify(members));
    window.localStorage.setItem("icj_users_initialized", "true");
    console.log("⚡ [SeedEcosystemService] Clean 7-Member Core Ecosystem Hydrated Cleanly!");
    return members;
  },

  /**
   * Get core master members
   */
  get26CoreMembers() {
    if (typeof window === "undefined" || !window.localStorage) return ENTERPRISE_SEED_USERS;
    try {
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
      return this.resetAndHydrate26CoreMembers();
    } catch (e) {
      console.error("Purge error", e);
    }
  }
};

export default SeedEcosystemService;
