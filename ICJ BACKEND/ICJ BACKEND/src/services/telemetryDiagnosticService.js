/**
 * TelemetryDiagnosticService — ICJ Enterprise Platform
 * Provides real-time data flow telemetry, entry interceptors, diagnostic logs,
 * storage sync verification, and health audit metrics for Super Admin.
 */

const TELEMETRY_KEY = "icj_telemetry_events";
const DIAGNOSTIC_HEALTH_KEY = "icj_system_health_audit";

const getLogs = () => {
  try {
    const raw = localStorage.getItem(TELEMETRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLogs = (logs) => {
  try {
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(logs.slice(0, 100))); // Keep last 100 entries
  } catch (e) {
    console.error("Telemetry write failed", e);
  }
};

export const TelemetryDiagnosticService = {
  init() {
    this.recordEvent({
      module: "SYSTEM",
      action: "TELEMETRY_INITIALIZED",
      status: "SUCCESS",
      details: "Real-time telemetry diagnostic interceptor initialized.",
    });
  },

  /**
   * Record every entry and data flow event across the platform
   */
  recordEvent({ module, action, payload = null, status = "SUCCESS", details = "" }) {
    const event = {
      id: `TEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      module,
      action,
      status,
      payloadSummary: payload ? (typeof payload === "object" ? JSON.stringify(payload).slice(0, 150) : String(payload).slice(0, 150)) : "N/A",
      details,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Server",
    };

    const logs = getLogs();
    logs.unshift(event);
    saveLogs(logs);

    return event;
  },

  /**
   * Get all telemetry diagnostic logs
   */
  getTelemetryLogs() {
    return getLogs();
  },

  /**
   * Comprehensive System Audit & Diagnostics
   */
  runFullSystemAudit() {
    const logs = getLogs();
    const errors = logs.filter((l) => l.status === "ERROR" || l.status === "WARNING");

    // Check localStorage status
    const keysAudited = [
      "icj_user",
      "icj_ai_legal_consultations",
      "icj_legal_cases_v2",
      "icj_advocates",
      "icj_master_gemini_key",
      "icj_master_openai_key",
    ];

    const storageAudit = keysAudited.map((key) => {
      const val = localStorage.getItem(key);
      return {
        key,
        exists: Boolean(val),
        sizeBytes: val ? val.length : 0,
        itemCount: val ? (val.startsWith("[") ? JSON.parse(val).length : 1) : 0,
      };
    });

    const auditSummary = {
      auditTimestamp: new Date().toISOString(),
      overallHealth: errors.length === 0 ? "EXCELLENT (100% CLEAN)" : `${errors.length} Warnings/Errors Logged`,
      totalEventsLogged: logs.length,
      errorCount: errors.length,
      storageAudit,
      recentErrors: errors.slice(0, 5),
    };

    localStorage.setItem(DIAGNOSTIC_HEALTH_KEY, JSON.stringify(auditSummary));
    return auditSummary;
  },

  /**
   * Clear all telemetry logs
   */
  clearLogs() {
    localStorage.removeItem(TELEMETRY_KEY);
    localStorage.removeItem(DIAGNOSTIC_HEALTH_KEY);
    return { success: true };
  },
};

export default TelemetryDiagnosticService;
