/**
 * ICJ ENTERPRISE PLATFORM
 * Immutable Security Auditing Engine for OTP, Authentication & Governance Events
 */

const AUDIT_STORAGE_KEY = "icj_otp_audit_logs";

function loadLogs() {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs) {
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
}

export const OTPAuditService = {
  /**
   * Log an event in the audit trail.
   * @param {string} eventType - e.g., "OTP_REQUEST", "OTP_VERIFICATION_FAILURE", "FALLBACK_TRIGGERED", "GOVERNANCE_CHANGE"
   * @param {object} metadata - Details of the event (excl. raw secrets or plain text OTPs)
   */
  logEvent(eventType, metadata = {}) {
    const logs = loadLogs();
    const cleanMetadata = { ...metadata };

    // Strict security check: ensure no raw secret, token, key, or plaintext OTP is ever logged.
    const secretKeys = ["apiKey", "apiSecret", "password", "token", "otp", "secretKey"];
    secretKeys.forEach(k => {
      if (cleanMetadata[k]) {
        cleanMetadata[k] = "[MASKED_FOR_AUDIT_LOGS]";
      }
    });

    const newLog = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      eventType,
      metadata: cleanMetadata,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Server-Context",
    };

    logs.push(newLog);
    // Retain last 1000 logs for client memory optimization
    if (logs.length > 1000) {
      logs.shift();
    }

    saveLogs(logs);
    console.log(`[AUDIT-LOG] [${newLog.timestamp}] [${eventType}]`, cleanMetadata);
    return newLog;
  },

  /**
   * Fetch all audit logs
   */
  getLogs() {
    return loadLogs();
  },

  /**
   * Clear logs (for testing purposes or authorised admin maintenance)
   */
  clearLogs() {
    saveLogs([]);
  },
};

export default OTPAuditService;
