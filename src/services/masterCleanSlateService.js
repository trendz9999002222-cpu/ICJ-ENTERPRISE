/**
 * MasterCleanSlateService — ICJ Enterprise Platform
 * 100% Virgin Production State (Factory Reset) Service.
 *
 * Forcefully purges ALL user uploaded documents, test cases, mock transaction figures,
 * mock notifications, dummy members, and test storage keys from browser LocalStorage.
 * Leaves STRICTLY 1 active pristine Super Admin account.
 */

import { ENTERPRISE_SEED_USERS } from "../data/seedUsers.js";

const VIRGIN_PURGE_KEY = "icj_virgin_state_2026_v40_FINAL_VIRTUAL_OFFICE_CLEAN";

const STORAGE_KEYS_TO_PURGE = [
  "icj_members",
  "icj_enterprise_users",
  "icj_wallets",
  "icj_tokens",
  "icj_donations",
  "icj_legal_cases",
  "icj_legal_cases_v2",
  "icj_documents",
  "icj_notifications",
  "icj_reports",
  "icj_settings",
  "icj_pinned_notes",
  "icj_communication_history",
  "icj_case_timelines",
  "icj_court_hearings",
  "icj_advocates",
  "icj_court_orders",
  "icj_invoices",
  "icj_trust_approvals",
  "icj_ai_drafts",
  "icj_case_memory_vault",
  "icj_users_initialized",
  "icj_purge_version",
  "icj_citizen_active_case",
  "icj_franchise_applications",
  "icj_virtual_offices",
];

export const MasterCleanSlateService = {
  /**
   * Perform 100% Force Factory Reset to Virgin State
   */
  executeVirginFactoryReset() {
    if (typeof window === "undefined" || !window.localStorage) return;

    try {
      // 1. Force purge all registered ICJ storage keys
      STORAGE_KEYS_TO_PURGE.forEach((key) => {
        try {
          window.localStorage.removeItem(key);
          window.sessionStorage.removeItem(key);
        } catch {}
      });

      // 2. Clear any OTP, Print, or Case session keys dynamically
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith("icj_") || key.includes("CASE") || key.includes("DOC")) {
          try {
            window.localStorage.removeItem(key);
          } catch {}
        }
      });

      // 3. Hydrate strictly 1 Pristine Super Admin User
      const singleSuperAdmin = ENTERPRISE_SEED_USERS;
      window.localStorage.setItem("icj_members", JSON.stringify(singleSuperAdmin));
      window.localStorage.setItem("icj_enterprise_users", JSON.stringify(singleSuperAdmin));
      window.localStorage.setItem("icj_legal_cases_v2", JSON.stringify([]));
      window.localStorage.setItem("icj_legal_cases", JSON.stringify([]));
      window.localStorage.setItem("icj_documents", JSON.stringify([]));
      window.localStorage.setItem("icj_users_initialized", "true");
      window.localStorage.setItem("icj_purge_version", "2026_V10_FINAL_SUPER_ADMIN_ONLY");
      window.localStorage.setItem(VIRGIN_PURGE_KEY, "true");

      console.log("⚡ [MasterCleanSlateService] Force Factory Reset Executed Cleanly! All Dummy Cases Purged!");
      return { success: true, count: 1, message: "System force reset to 100% Virgin State (1 Super Admin Only)." };
    } catch (err) {
      console.error("MasterCleanSlateService Error:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Auto-run check on application startup
   */
  autoEnforceVirginStateOnStartup() {
    if (typeof window === "undefined" || !window.localStorage) return;
    const isVirgin = window.localStorage.getItem(VIRGIN_PURGE_KEY);
    if (!isVirgin) {
      this.executeVirginFactoryReset();
    }
  }
};

// Execute immediately upon module import in browser
if (typeof window !== "undefined" && window.localStorage) {
  MasterCleanSlateService.autoEnforceVirginStateOnStartup();
}

export default MasterCleanSlateService;
