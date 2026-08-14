/**
 * UserAuditTelemetryService — ICJ Enterprise Platform
 * Provides User Access Audit Logs, Fraud/Overuse Detection, Credit Threshold Popups
 * and 1-Click Account Suspension Control for Super Admin.
 */

const AUDIT_LOGS_KEY = "icj_user_audit_logs";
const ACCOUNT_STATUS_KEY = "icj_user_account_statuses";

export const UserAuditTelemetryService = {
  /**
   * Log User Access Telemetry (Who accessed, When, Which device/phone, Actions)
   */
  logAccess({ userId, userName, userPhone, role, action, details = "" }) {
    try {
      const logs = this.getAuditLogs();
      const newEntry = {
        id: `AUDIT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: userId || "GUEST",
        userName: userName || "Unknown User",
        userPhone: userPhone || "N/A",
        role: role || "Litigant",
        action: action || "PAGE_VIEW",
        details: details || "",
        ipAddress: "192.168.1.1 (Secure Enterprise Session)",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent.substring(0, 50) : "Browser",
      };
      logs.unshift(newEntry);
      // Keep last 200 logs
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs.slice(0, 200)));
      return newEntry;
    } catch (e) {
      console.error("Audit log failed", e);
      return null;
    }
  },

  getAuditLogs() {
    try {
      const raw = localStorage.getItem(AUDIT_LOGS_KEY);
      return raw ? JSON.parse(raw) : [
        {
          id: "AUDIT-001",
          timestamp: new Date().toISOString(),
          userId: "CLIENT-01",
          userName: "Client 1 (Ramesh Kumar)",
          userPhone: "+91 9876543210",
          role: "member",
          action: "AI_CONSULTATION_QUERY",
          details: "Asked about Civil Property Dispute",
          ipAddress: "103.21.124.5",
          userAgent: "Mozilla/5.0 (Windows NT 10.0)",
        },
        {
          id: "AUDIT-002",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: "ADV-01",
          userName: "Senior Advocate 1 (Rajesh Sharma)",
          userPhone: "+91 9811223344",
          role: "advocate",
          action: "1_CLICK_CITATION_MERGE",
          details: "Merged Supreme Court Citation 1992 Supp (1) SCC 335",
          ipAddress: "115.240.92.14",
          userAgent: "Mozilla/5.0 (Macintosh)",
        },
      ];
    } catch {
      return [];
    }
  },

  /**
   * Account Status & Suspension Management
   */
  getAccountStatus(userId) {
    try {
      const raw = localStorage.getItem(ACCOUNT_STATUS_KEY);
      const map = raw ? JSON.parse(raw) : {};
      return map[userId] || { status: "ACTIVE", warningMessage: null, warningCount: 0 };
    } catch {
      return { status: "ACTIVE", warningMessage: null, warningCount: 0 };
    }
  },

  setAccountStatus(userId, statusData) {
    try {
      const raw = localStorage.getItem(ACCOUNT_STATUS_KEY);
      const map = raw ? JSON.parse(raw) : {};
      map[userId] = { ...this.getAccountStatus(userId), ...statusData, updatedAt: new Date().toISOString() };
      localStorage.setItem(ACCOUNT_STATUS_KEY, JSON.stringify(map));
      return map[userId];
    } catch (e) {
      console.error("Account status save failed", e);
      return null;
    }
  },

  /**
   * Super Admin Action: Send Recharge Warning Popup
   */
  triggerRechargeWarning(userId, customMsg) {
    const warningMsg = customMsg || "⚠️ चेतावनी: आपका AI क्रेडिट 10% से कम रह गया है। निर्बाध सेवा हेतु तुरंत रीचार्ज करें वरना आपका खाता सस्पेंड कर दिया जाएगा।";
    return this.setAccountStatus(userId, {
      status: "WARNING_SENT",
      warningMessage: warningMsg,
      warningCount: (this.getAccountStatus(userId).warningCount || 0) + 1,
    });
  },

  /**
   * Super Admin Action: Suspend Account
   */
  suspendAccount(userId, reason = "Excessive Misuse / Payment Overdue") {
    return this.setAccountStatus(userId, {
      status: "SUSPENDED",
      suspensionReason: reason,
      suspendedAt: new Date().toISOString(),
    });
  },

  /**
   * Super Admin Action: Reactivate Account
   */
  reactivateAccount(userId) {
    return this.setAccountStatus(userId, {
      status: "ACTIVE",
      warningMessage: null,
      suspensionReason: null,
      reactivatedAt: new Date().toISOString(),
    });
  },
};

export default UserAuditTelemetryService;
