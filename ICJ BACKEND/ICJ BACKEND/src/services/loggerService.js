/**
 * ICJ ENTERPRISE PLATFORM — CENTRALIZED RUNTIME LOGGER SERVICE
 * Captures, logs, and stores client-side runtime errors and telemetry.
 */

const LOGS_KEY = "icj_runtime_logs";
const MAX_LOGS = 100;

export class LoggerService {
  static logError(context, error, errorInfo = null) {
    const entry = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      level: "ERROR",
      context: String(context || "GlobalRuntime"),
      message: error?.message || String(error || "Unknown Runtime Exception"),
      stack: error?.stack || null,
      errorInfo: errorInfo ? String(errorInfo.componentStack || errorInfo) : null,
    };

    console.error(`[ICJ LOGGER] [${entry.context}]`, entry.message, entry);

    try {
      const logs = this.getLogs();
      logs.unshift(entry);
      if (logs.length > MAX_LOGS) logs.pop();
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    } catch {
      // safe fallback if localStorage quota exceeded
    }

    return entry;
  }

  static logInfo(context, message) {
    const entry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: "INFO",
      context: String(context || "General"),
      message: String(message),
    };

    try {
      const logs = this.getLogs();
      logs.unshift(entry);
      if (logs.length > MAX_LOGS) logs.pop();
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    } catch {
      // safe fallback
    }
  }

  static getLogs() {
    try {
      const raw = localStorage.getItem(LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static clearLogs() {
    try {
      localStorage.removeItem(LOGS_KEY);
    } catch {
      // safe
    }
  }
}

export default LoggerService;
