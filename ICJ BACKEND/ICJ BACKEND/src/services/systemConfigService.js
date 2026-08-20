/**
 * ICJ System Configuration & Partner Plan Launch Control Service
 *
 * Manages phased rollout of partner plans, Admin launch switches, and automated member broadcast notifications.
 */

const PLAN_CONFIG_KEY = "icj_partner_plan_config";
const NOTIFICATIONS_KEY = "icj_system_notifications";

const DEFAULT_PLAN_CONFIG = {
  plan_standard: {
    id: "plan_standard",
    name: "Standard Client Legal Aid Plan",
    description: "Standard legal intake, AI diagnosis, and advocate allotment",
    status: "LAUNCHED",
    icon: "🟢",
    launchedAt: new Date().toISOString(),
  },
  plan_egov: {
    id: "plan_egov",
    name: "E-Governance & Digital Operator Plan",
    description: "Operate e-Courts, Tehsil Bhulekh, RTI, GST & Trademark portals",
    status: "LOCKED",
    icon: "🔵",
    launchedAt: null,
  },
  plan_affiliate: {
    id: "plan_affiliate",
    name: "Legal Referral & Affiliate Earnings Plan",
    description: "Refer clients/matters to ICJ Trust and earn referral incentives in ICJ Wallet",
    status: "LOCKED",
    icon: "🟠",
    launchedAt: null,
  },
  plan_lawfirm: {
    id: "plan_lawfirm",
    name: "Law Firm Enterprise Partnership Plan",
    description: "Operate a Law Firm / ICJ Legal Services Centre in collaboration with Trust Advocates",
    status: "LOCKED",
    icon: "🟣",
    launchedAt: null,
  },
};

const readStore = (key, fallback) => {
  try {
    const storage = typeof window !== "undefined" ? window.localStorage : globalThis.localStorage;
    const raw = storage ? storage.getItem(key) : null;
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStore = (key, val) => {
  try {
    const storage = typeof window !== "undefined" ? window.localStorage : globalThis.localStorage;
    if (storage) storage.setItem(key, JSON.stringify(val));
  } catch { /* ignore */ }
};

export const SystemConfigService = {
  getPlanConfigs() {
    return readStore(PLAN_CONFIG_KEY, DEFAULT_PLAN_CONFIG);
  },

  getPlan(planId) {
    const configs = this.getPlanConfigs();
    return configs[planId] || null;
  },

  isPlanActive(planId) {
    const plan = this.getPlan(planId);
    return plan?.status === "LAUNCHED";
  },

  launchPlan(planId) {
    const configs = this.getPlanConfigs();
    if (!configs[planId]) return false;

    const plan = configs[planId];
    plan.status = "LAUNCHED";
    plan.launchedAt = new Date().toISOString();

    configs[planId] = plan;
    writeStore(PLAN_CONFIG_KEY, configs);

    // Generate Broadcast Notification to all members
    const notification = {
      id: `NOTIF-${Date.now()}`,
      title: `🎉 NEW PLAN LAUNCHED: ${plan.name}!`,
      message: `ICJ Trust has officially unlocked the ${plan.name}. Open your Client Portal to explore new opportunities!`,
      type: "BROADCAST",
      planId,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const existingNotifs = readStore(NOTIFICATIONS_KEY, []);
    writeStore(NOTIFICATIONS_KEY, [notification, ...existingNotifs]);

    return plan;
  },

  lockPlan(planId) {
    const configs = this.getPlanConfigs();
    if (!configs[planId] || planId === "plan_standard") return false;

    configs[planId].status = "LOCKED";
    writeStore(PLAN_CONFIG_KEY, configs);
    return configs[planId];
  },

  getNotifications() {
    return readStore(NOTIFICATIONS_KEY, []);
  },
};

export default SystemConfigService;
