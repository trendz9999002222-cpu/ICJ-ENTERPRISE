/**
 * FeatureControlService — ICJ Enterprise Platform
 * Master Phased Launch & Feature Flag Control Engine
 * Supports:
 * 1. Global Platform Switches (Switches ON/OFF for all users globally)
 * 2. Scheduled Phased Rollout Timers (Auto-launch on future date/time)
 * 3. Individual User Service Blocking / Overrides (Block/Enable service per member/advocate)
 * 4. Immutable Audit Telemetry Log
 */

const GLOBAL_FLAGS_KEY = "icj_feature_flags_global";
const USER_OVERRIDES_KEY = "icj_feature_user_overrides";
const AUDIT_LOGS_KEY = "icj_feature_control_audit_logs";

const DEFAULT_GLOBAL_FLAGS = {
  videoConference: { id: "videoConference", name: "Multi-Party WebRTC Video Conference", enabled: true, category: "Communication", description: "Allows 3-8 member live video/audio consultation chambers." },
  aiLegalDrafter: { id: "aiLegalDrafter", name: "AI Legal Petition & Document Drafter", enabled: true, category: "AI Services", description: "Automated legal petition generation from voice & case text." },
  tokenExchange: { id: "tokenExchange", name: "ICJ Token Exchange & Wallet Ledger", enabled: true, category: "Finance", description: "Public ICJ Token trading and credit purchasing." },
  virtualChambers: { id: "virtualChambers", name: "Virtual Court Offices & Empaneled Desks", enabled: true, category: "Ecosystem", description: "Pan-India advocate virtual chambers and junior desks." },
  voiceCorrection: { id: "voiceCorrection", name: "Voice-Powered Metadata Auto-Correction Studio", enabled: true, category: "Legal Tools", description: "Voice-driven party name and address correction engine." },
  casePropertySeals: { id: "casePropertySeals", name: "Official Case Property SHA-256 Digital Seals", enabled: true, category: "Security", description: "Cryptographic evidence tagging for legal documents." },
};

const getStore = (key, defaultVal = {}) => {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultVal;
    }
    return defaultVal;
  } catch {
    return defaultVal;
  }
};

const setStore = (key, val) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (e) {
    console.error("FeatureControlService setStore error", e);
  }
};

export const FeatureControlService = {
  /**
   * Get all Global Feature Flags
   */
  getGlobalFlags() {
    const flags = getStore(GLOBAL_FLAGS_KEY, null);
    if (!flags) {
      setStore(GLOBAL_FLAGS_KEY, DEFAULT_GLOBAL_FLAGS);
      return DEFAULT_GLOBAL_FLAGS;
    }
    return flags;
  },

  /**
   * Toggle Global Feature Flag (ON / OFF)
   */
  toggleGlobalFeature(featureId, enabled, adminUsername = "Super Admin", scheduledDate = null) {
    const flags = this.getGlobalFlags();
    if (flags[featureId]) {
      flags[featureId].enabled = Boolean(enabled);
      if (scheduledDate) {
        flags[featureId].scheduledDate = scheduledDate;
      }
      setStore(GLOBAL_FLAGS_KEY, flags);

      this.logAudit({
        adminUsername,
        action: enabled ? "ENABLE_GLOBAL_FEATURE" : "DISABLE_GLOBAL_FEATURE",
        featureId,
        featureName: flags[featureId].name,
        target: "GLOBAL_PLATFORM",
        details: scheduledDate ? `Scheduled for launch on ${scheduledDate}` : `Global state set to ${enabled ? "ON" : "OFF"}`
      });

      return { success: true, flags };
    }
    return { success: false, message: "Feature ID not found" };
  },

  /**
   * Check if a feature is enabled globally AND for a specific user
   */
  isFeatureAccessible(featureId, userId = null) {
    const flags = this.getGlobalFlags();
    const globalState = flags[featureId] ? flags[featureId].enabled : true;

    // If turned OFF globally, block access
    if (!globalState) return { accessible: false, reason: "GLOBAL_DISABLED", message: "This feature is currently offline for scheduled maintenance or phased rollout." };

    // Check individual user override if userId provided
    if (userId) {
      const overrides = getStore(USER_OVERRIDES_KEY, {});
      const userKey = String(userId).toLowerCase();
      if (overrides[userKey] && overrides[userKey][featureId] !== undefined) {
        const userAccess = overrides[userKey][featureId];
        if (!userAccess) {
          return { accessible: false, reason: "USER_BLOCKED", message: "Your access to this service has been individually restricted by Super Admin." };
        }
      }
    }

    return { accessible: true, reason: "ALLOWED" };
  },

  /**
   * Block or Enable a feature for a specific individual user
   */
  setUserFeatureOverride(userId, userName, featureId, enabled, adminUsername = "Super Admin") {
    const overrides = getStore(USER_OVERRIDES_KEY, {});
    const userKey = String(userId).toLowerCase();

    if (!overrides[userKey]) {
      overrides[userKey] = {};
    }

    overrides[userKey][featureId] = Boolean(enabled);
    setStore(USER_OVERRIDES_KEY, overrides);

    this.logAudit({
      adminUsername,
      action: enabled ? "ENABLE_USER_SERVICE" : "BLOCK_USER_SERVICE",
      featureId,
      targetUserId: userId,
      targetUserName: userName,
      target: `USER:${userId}`,
      details: `Individual service access set to ${enabled ? "ENABLED" : "BLOCKED"} for ${userName} (${userId})`
    });

    return { success: true, overrides: overrides[userKey] };
  },

  /**
   * Get User Overrides Map
   */
  getUserOverrides() {
    return getStore(USER_OVERRIDES_KEY, {});
  },

  /**
   * Log Immutable Audit Event
   */
  logAudit(event = {}) {
    const logs = getStore(AUDIT_LOGS_KEY, []);
    const entry = {
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUsername: event.adminUsername || "Super Admin",
      action: event.action || "FEATURE_CONTROL_EVENT",
      featureId: event.featureId || "GENERAL",
      target: event.target || "PLATFORM",
      details: event.details || "",
    };
    logs.unshift(entry);
    setStore(AUDIT_LOGS_KEY, logs);
  },

  /**
   * Get Audit Logs
   */
  getAuditLogs() {
    return getStore(AUDIT_LOGS_KEY, []);
  }
};

export default FeatureControlService;
