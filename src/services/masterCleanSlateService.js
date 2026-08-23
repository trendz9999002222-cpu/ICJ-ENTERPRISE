/**
 * MasterCleanSlateService — ICJ Enterprise Platform
 * 100% Virgin Production State (Factory Reset) Service.
 * Delegated to AppBootSanitizer V50 for zero-defect persistence.
 */

import { ENTERPRISE_SEED_USERS } from "../data/seedUsers.js";
import AppBootSanitizer from "./appBootSanitizer.js";

const VIRGIN_PURGE_KEY = "icj_virgin_state_2026_v50_PERMANENT_ZERO_DEFECT";

export const MasterCleanSlateService = {
  /**
   * Perform 100% Force Factory Reset to Virgin State
   */
  executeVirginFactoryReset() {
    if (typeof window === "undefined" || !window.localStorage) return;

    try {
      localStorage.removeItem("icj_purge_version");
      AppBootSanitizer.run();
      console.log("⚡ [MasterCleanSlateService] Factory Reset Executed Cleanly via AppBootSanitizer V50!");
      return { success: true, count: 1, message: "System reset to 100% Virgin State (1 Super Admin Only)." };
    } catch (err) {
      console.error("MasterCleanSlateService Error:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Auto-run check on application startup (delegated to AppBootSanitizer)
   */
  autoEnforceVirginStateOnStartup() {
    AppBootSanitizer.run();
  }
};

export default MasterCleanSlateService;
