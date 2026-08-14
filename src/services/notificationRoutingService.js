/**
 * NotificationRoutingService — ICJ Enterprise Platform
 * Provides Super Admin with full rights to configure Notification Routing & Divert Targets.
 * Manages which Admins, Sub-Admins, and Operations Staff receive instant push notifications,
 * sound chimes, and alert popups for member onboarding, SLA events, and legal submissions.
 */

const ROUTING_RULES_KEY = "icj_notification_routing_rules";
const RECIPIENT_ADMINS_KEY = "icj_notification_recipient_admins";

export const NotificationRoutingService = {
  /**
   * Get all registered Admins & Sub-Admins eligible for notification routing
   */
  getEligibleAdmins() {
    try {
      const allUsers = JSON.parse(localStorage.getItem("icj_enterprise_users") || localStorage.getItem("icj_members") || "[]");
      const admins = allUsers.filter((u) => ["admin", "super_admin", "guest_admin", "employee"].includes(String(u.role || u.user_type).toLowerCase()));

      if (admins.length === 0) {
        return [
          { id: "ICJ/1/SAD-000001/EXECUTIVE", name: "ICJ Super Admin", email: "icjsuperadmin1234@icj.org", phone: "+91 9999900001", role: "super_admin", enabled: true },
          { id: "ICJ/2/ADM-000001/PRO", name: "ICJ Operations Admin", email: "icjadmin1234@icj.org", phone: "+91 9999900002", role: "admin", enabled: true },
        ];
      }

      const activeRecipients = this.getRecipientAdminIds();
      return admins.map((a) => ({
        id: a.id || a.member_id || a.email,
        name: a.fullName || a.name || a.username || "Admin User",
        email: a.email || "",
        phone: a.mobile || a.phone || "+91 9999900000",
        role: a.role || a.user_type || "admin",
        enabled: activeRecipients.includes(String(a.id || a.member_id || a.email)),
      }));
    } catch {
      return [];
    }
  },

  getRecipientAdminIds() {
    try {
      const raw = localStorage.getItem(RECIPIENT_ADMINS_KEY);
      return raw ? JSON.parse(raw) : ["ICJ/1/SAD-000001/EXECUTIVE", "ICJ/2/ADM-000001/PRO"];
    } catch {
      return ["ICJ/1/SAD-000001/EXECUTIVE", "ICJ/2/ADM-000001/PRO"];
    }
  },

  saveRecipientAdminIds(ids) {
    try {
      localStorage.setItem(RECIPIENT_ADMINS_KEY, JSON.stringify(ids));
      return ids;
    } catch (e) {
      console.error("Failed to save recipient admin IDs", e);
      return [];
    }
  },

  /**
   * Event-specific Notification Divert Toggles
   */
  getRoutingRules() {
    try {
      const raw = localStorage.getItem(ROUTING_RULES_KEY);
      return raw ? JSON.parse(raw) : {
        NEW_MEMBER_JOINED: true,
        SLA_15MIN_EXPIRATION: true,
        LEGAL_ISSUE_SUBMITTED: true,
        FRANCHISE_APPLICATION: true,
        DOORSTEP_NOTARY_OATH_REQ: true,
      };
    } catch {
      return {
        NEW_MEMBER_JOINED: true,
        SLA_15MIN_EXPIRATION: true,
        LEGAL_ISSUE_SUBMITTED: true,
        FRANCHISE_APPLICATION: true,
        DOORSTEP_NOTARY_OATH_REQ: true,
      };
    }
  },

  saveRoutingRules(rules) {
    try {
      localStorage.setItem(ROUTING_RULES_KEY, JSON.stringify(rules));
      return rules;
    } catch (e) {
      console.error("Failed to save routing rules", e);
      return {};
    }
  },

  /**
   * Broadcast Divert Payload to All Configured Active Admins
   */
  broadcastEventDivert(eventType, payload) {
    const rules = this.getRoutingRules();
    if (!rules[eventType]) {
      console.log(`Notification routing for event ${eventType} is disabled.`);
      return false;
    }

    const recipientIds = this.getRecipientAdminIds();
    const eligibleAdmins = this.getEligibleAdmins().filter((a) => recipientIds.includes(String(a.id)));

    console.log(`[DIVERT BROADCAST] Broadcasting event ${eventType} to ${eligibleAdmins.length} active admins:`, eligibleAdmins.map(a => a.name));

    return {
      success: true,
      eventType,
      divertedToCount: eligibleAdmins.length,
      recipients: eligibleAdmins,
      dispatchedAt: new Date().toISOString(),
    };
  },
};

export default NotificationRoutingService;
