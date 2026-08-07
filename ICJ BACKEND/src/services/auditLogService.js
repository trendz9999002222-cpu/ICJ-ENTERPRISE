import { SUPABASE_ENABLED, supabase } from "./supabase";

const AUTH_AUDIT_KEY = "icj_auth_audit_logs";
const ADMIN_AUDIT_LEGACY_KEY = "icj_admin_audit";
const OBSERVABILITY_LOG_KEY = "icj_observability_logs";
const AUDIT_DEDUPE_KEY = "icj_audit_dedupe_v1";
const RUNTIME_AUDIT_FLAG = "__icj_audit_runtime_initialized";
const OBSERVABILITY_LEVELS = new Set(["INFO", "WARNING", "ERROR", "SECURITY", "AUDIT"]);
const ADMIN_MODULES = new Set(["administration", "membership", "security", "system"]);
const DEDUPE_WINDOW_MS = 5000;
const DEDUPE_RETENTION_MS = 5 * 60 * 1000;
const auditableActions = new Set([
  "registration",
  "login",
  "logout",
  "login_failure",
  "password_change",
  "password_reset",
  "session_expired",
  "profile_update",
  "forgot_user_id_request",
  "account_recovery_request",
  "recovery_review",
  "recovery_approved",
  "recovery_rejected",
  "security_registration_rate_limited",
  "security_login_rate_limited",
  "security_bruteforce_detected",
  "security_account_lockout",
  "security_account_unlocked",
  "security_risk_scored",
  "session_created",
  "session_activity",
  "session_logout",
  "session_revoked_admin",
  "session_revoked_self",
  "session_revoked_others",
  "device_registered",
  "device_activity",
  "device_revoked_user",
  "device_revoked_admin",
  "device_remote_logout",
  "member_created",
  "member_updated",
  "member_viewed",
  "member_activated",
  "member_suspended",
  "member_deactivated",
  "member_archived",
  "member_soft_deleted",
  "member_restore",
  "membership_id_generated",
  "membership_lifecycle_transition",
  "member_approved",
  "member_rejected",
  "member_pending",
  "role_changed",
  "permission_changed",
  "settings_changed",
  "configuration_changed",
  "unauthorized_access",
  "permission_denied",
  "invalid_operation",
  "invalid_lifecycle_transition",
  "invalid_status_change",
  "build_version",
  "database_migration",
  "system_startup",
  "system_shutdown",
  "finance_account_created",
  "finance_account_updated",
  "finance_transaction_posted",
  "finance_wallet_transaction_posted",
  "finance_entry_deleted",
  "finance_settings_updated",
  "document_uploaded",
  "document_updated",
  "document_deleted",
  "document_version_uploaded",
  "document_downloaded",
  "document_previewed",
  "document_category_added",
  "document_folder_created",
  "document_settings_updated",
  "workflow_definition_created",
  "workflow_started",
  "workflow_approved",
  "workflow_rejected",
  "workflow_settings_updated",
  "notification_created",
  "notification_template_created",
  "notification_queued",
  "notification_processed",
  "notification_settings_updated",
  "manual_audit",
]);
const ACTION_ALIASES = {
  security_login_failed: "login_failure",
  security_login_success: "login",
  forgot_password_request: "password_reset",
  member_role_changed: "role_changed",
};
const observabilitySinks = new Set();
const auditSinks = new Set();

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const toIsoString = (value) => {
  const timestamp = value ? new Date(value).toISOString() : new Date().toISOString();
  return timestamp;
};

const normalizeObject = (value, fallback = {}) => (
  value && typeof value === "object" && !Array.isArray(value) ? value : fallback
);

const toVersionNumber = (value) => {
  if (value === null || value === undefined || value === "") return 1;
  return value;
};

const simpleChecksum = (value = "") => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return `chk-${hash.toString(16).padStart(8, "0")}`;
};

const createUuid = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `audit-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

const readLocalLogs = () => {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(AUTH_AUDIT_KEY), []);
};

const readObservabilityLogs = () => {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(OBSERVABILITY_LOG_KEY), []);
};

const readDedupeCache = () => {
  if (typeof window === "undefined") return {};
  return safeParse(window.localStorage.getItem(AUDIT_DEDUPE_KEY), {});
};

const readLegacyAdminLogs = () => {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(ADMIN_AUDIT_LEGACY_KEY), []);
};

const writeLocalLogs = (rows) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_AUDIT_KEY, JSON.stringify(rows));
};

const writeObservabilityLogs = (rows) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OBSERVABILITY_LOG_KEY, JSON.stringify(rows));
};

const writeDedupeCache = (value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUDIT_DEDUPE_KEY, JSON.stringify(value));
};

const normalizeAction = (action) => {
  const normalized = String(action || "profile_update").trim().toLowerCase().replace(/\s+/g, "_");
  const canonical = ACTION_ALIASES[normalized] || normalized;
  return auditableActions.has(canonical) ? canonical : normalized;
};

const inferModule = (action, event = {}, metadata = {}) => {
  if (event.module) return String(event.module).toLowerCase();
  if (metadata.module) return String(metadata.module).toLowerCase();
  if (action.startsWith("member") || action.startsWith("membership")) return "membership";
  if (["settings_changed", "permission_changed", "role_changed", "configuration_changed"].includes(action)) return "administration";
  if (action.startsWith("system") || action === "build_version" || action === "database_migration") return "system";
  if (action.includes("unauthorized") || action.includes("permission") || action.includes("invalid") || action.startsWith("security_")) return "security";
  if (action.includes("login") || action.includes("logout") || action.includes("password") || action.startsWith("session_") || action === "registration") return "authentication";
  if (action.startsWith("document")) return "documents";
  if (action.startsWith("finance")) return "finance";
  if (action.startsWith("workflow")) return "workflow";
  if (action.startsWith("notification")) return "notifications";
  return "system";
};

const inferEntity = (action, event = {}, metadata = {}) => {
  if (event.entity) return event.entity;
  if (metadata.entity) return metadata.entity;
  const moduleName = inferModule(action, event, metadata);
  if (moduleName === "membership") return "member";
  if (moduleName === "administration") return "settings";
  if (moduleName === "authentication") return "session";
  return moduleName;
};

const inferSeverity = (action, event = {}, status = "success") => {
  const explicit = String(event.severity || "").toUpperCase();
  if (OBSERVABILITY_LEVELS.has(explicit)) return explicit;
  if (action.includes("unauthorized") || action.includes("permission") || action.startsWith("security_")) return "SECURITY";
  if (action.includes("invalid") || status === "warning") return "WARNING";
  if (status === "failed" || status === "error") return "ERROR";
  return "AUDIT";
};

const buildDedupeKey = (audit) => String(
  audit.dedupeKey
  || [audit.action, audit.module, audit.entity, audit.entityUuid, audit.actorUuid, audit.result, audit.correlationId].join("|")
);

const shouldSuppressDuplicate = (audit) => {
  const cache = readDedupeCache();
  const now = Date.now();
  const nextCache = Object.fromEntries(
    Object.entries(cache).filter(([, timestamp]) => now - Number(timestamp || 0) <= DEDUPE_RETENTION_MS)
  );
  const key = buildDedupeKey(audit);
  const previous = Number(nextCache[key] || 0);
  nextCache[key] = now;
  writeDedupeCache(nextCache);
  return previous > 0 && now - previous <= DEDUPE_WINDOW_MS;
};

const freezeAudit = (audit) => Object.freeze({ ...audit });

const buildAuditMetadata = (audit, metadata = {}) => ({
  ...metadata,
  audit: audit,
  schema_version: 1,
  integrity_signature: audit.integritySignature,
});

const normalizeAuditEntry = (event = {}) => {
  const metadata = normalizeObject(event.metadata);
  const action = normalizeAction(event.action);
  const timestamp = toIsoString(event.eventTime || metadata.timestamp);
  const moduleName = inferModule(action, event, metadata);
  const entity = inferEntity(action, event, metadata);
  const actorUuid = event.actorUuid || event.userId || metadata.actor_uuid || metadata.actor_user_id || null;
  const actorRole = event.actorRole || metadata.actor_role || null;
  const actorName = event.actorName || metadata.actor_name || null;
  const entityUuid = event.entityUuid || metadata.entity_uuid || metadata.member_uuid || metadata.target_user_id || metadata.target_member_id || null;
  const membershipId = event.membershipId || metadata.membership_id || metadata.member_id || null;
  const previousState = event.previousState || metadata.previous_state || {
    status: metadata.previous_status || null,
    role: metadata.previous_role || null,
  };
  const newState = event.newState || metadata.new_state || {
    status: metadata.new_status || null,
    role: metadata.new_role || null,
  };
  const result = String(event.result || event.status || metadata.result || "success").toLowerCase();
  const failureReason = event.failureReason || metadata.failure_reason || metadata.reason || null;
  const requestSource = event.requestSource || event.source || metadata.request_source || event.source || "web";
  const ipAddress = event.ipAddress || metadata.ip_address || null;
  const deviceInformation = event.deviceInformation || metadata.device_information || null;
  const sessionId = event.sessionId || metadata.session_id || metadata.session_reference || null;
  const correlationId = event.correlationId || metadata.correlation_id || createUuid();
  const versionNumber = toVersionNumber(event.versionNumber || metadata.version_number || metadata.version_no || 1);
  const auditUuid = event.auditUuid || metadata.audit_uuid || createUuid();
  const severity = inferSeverity(action, event, result);
  const audit = {
    auditUuid,
    timestamp,
    module: moduleName,
    entity,
    entityUuid,
    membershipId,
    action,
    previousState,
    newState,
    actorUuid,
    actorRole,
    actorName,
    result,
    failureReason,
    requestSource,
    ipAddress,
    deviceInformation,
    sessionId,
    correlationId,
    versionNumber,
    severity,
    email: event.email || metadata.email || null,
    message: event.message || metadata.message || action,
    dedupeKey: event.dedupeKey || metadata.dedupe_key || null,
  };
  const integritySignature = simpleChecksum(JSON.stringify(audit));
  return freezeAudit({ ...audit, integritySignature });
};

const toStorageRow = (event = {}, audit) => ({
  id: audit.auditUuid,
  action: audit.action,
  user_id: audit.actorUuid,
  email: audit.email,
  status: audit.result,
  source: audit.requestSource,
  metadata: buildAuditMetadata(audit, normalizeObject(event.metadata)),
  event_time: audit.timestamp,
  created_at: audit.timestamp,
});

const toObservabilityRow = (audit) => ({
  id: audit.auditUuid,
  level: audit.severity,
  category: audit.severity === "SECURITY" ? "security" : "audit",
  timestamp: audit.timestamp,
  module: audit.module,
  action: audit.action,
  message: audit.message,
  correlation_id: audit.correlationId,
  entity_uuid: audit.entityUuid,
  actor_uuid: audit.actorUuid,
  result: audit.result,
});

const publishObservability = (audit) => {
  const row = toObservabilityRow(audit);
  const current = readObservabilityLogs();
  writeObservabilityLogs([row, ...current].slice(0, 1000));
  observabilitySinks.forEach((sink) => {
    try {
      sink(row);
    } catch {
      // Ignore sink failures to preserve business flow.
    }
  });
};

const publishAudit = (audit) => {
  auditSinks.forEach((sink) => {
    try {
      sink(audit);
    } catch {
      // Ignore sink failures to preserve business flow.
    }
  });
  publishObservability(audit);
};

const mapStoredRowToAudit = (row = {}) => {
  const metadata = normalizeObject(row.metadata);
  const audit = metadata.audit;
  if (audit && typeof audit === "object") {
    return freezeAudit({
      ...audit,
      auditUuid: audit.auditUuid || row.id || createUuid(),
      timestamp: audit.timestamp || row.event_time || row.created_at || new Date().toISOString(),
      integritySignature: audit.integritySignature || metadata.integrity_signature || simpleChecksum(JSON.stringify(audit)),
    });
  }

  return normalizeAuditEntry({
    action: row.action,
    userId: row.user_id,
    email: row.email,
    status: row.status,
    source: row.source,
    eventTime: row.event_time || row.created_at,
    metadata,
  });
};

const mapLegacyAdminRowToAudit = (row = {}) => normalizeAuditEntry({
  action: row.action || "manual_audit",
  userId: row.actor_user_id || null,
  source: "admin",
  eventTime: row.timestamp || row.created_at,
  metadata: {
    module: "administration",
    entity: "settings",
    actor_name: row.actor_name || null,
    actor_role: row.actor_role || null,
    target_user_id: row.target_user_id || null,
    previous_status: row.previous_status || null,
    new_status: row.new_status || null,
    previous_role: row.previous_role || null,
    new_role: row.new_role || null,
    notes: row.notes || "",
    message: row.message || row.action || "manual_audit",
  },
});

const sortAuditRows = (rows, sortBy = "timestamp", sortOrder = "desc") => {
  const direction = String(sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    const leftValue = left?.[sortBy];
    const rightValue = right?.[sortBy];
    if (sortBy === "timestamp") {
      return (new Date(leftValue).getTime() - new Date(rightValue).getTime()) * direction;
    }
    return String(leftValue || "").localeCompare(String(rightValue || "")) * direction;
  });
};

const applyFilters = (rows, filters = {}) => {
  const source = filters && typeof filters === "object" ? filters : {};
  return rows.filter((row) => {
    const timestamp = new Date(row.timestamp).getTime();
    if (source.dateFrom && timestamp < new Date(source.dateFrom).getTime()) return false;
    if (source.dateTo && timestamp > new Date(source.dateTo).getTime()) return false;
    if (source.module && String(row.module) !== String(source.module).toLowerCase()) return false;
    if (source.action && String(row.action) !== String(source.action).toLowerCase()) return false;
    if (source.user) {
      const needle = String(source.user).toLowerCase();
      const haystack = [row.actorUuid, row.actorName, row.email].map((value) => String(value || "").toLowerCase());
      if (!haystack.some((value) => value.includes(needle))) return false;
    }
    if (source.membership && String(row.membershipId || "") !== String(source.membership)) return false;
    if (source.entity && String(row.entity) !== String(source.entity).toLowerCase()) return false;
    if (source.result && String(row.result) !== String(source.result).toLowerCase()) return false;
    if (source.severity && String(row.severity) !== String(source.severity).toUpperCase()) return false;
    return true;
  });
};

const AuditLogService = {
  registerObservabilitySink(handler) {
    if (typeof handler === "function") observabilitySinks.add(handler);
    return () => observabilitySinks.delete(handler);
  },

  registerAuditSink(handler) {
    if (typeof handler === "function") auditSinks.add(handler);
    return () => auditSinks.delete(handler);
  },

  async logAuditEvent(event = {}) {
    const audit = normalizeAuditEntry(event);
    if (shouldSuppressDuplicate(audit)) {
      return { ...audit, skipped: true, duplicatePrevented: true };
    }

    const row = toStorageRow(event, audit);
    if (SUPABASE_ENABLED) {
      try {
        const { error } = await supabase.from("auth_audit_logs").insert([row]);
        if (!error) {
          publishAudit(audit);
          return audit;
        }
      } catch {
        // Fall back to local cache when DB write fails.
      }
    }

    const logs = readLocalLogs();
    writeLocalLogs([row, ...logs].slice(0, 1000));
    publishAudit(audit);
    return audit;
  },

  async logAuthEvent(event = {}) {
    return this.logAuditEvent(event);
  },

  async logBusinessEvent(event = {}) {
    return this.logAuditEvent({ ...event, severity: event.severity || "AUDIT" });
  },

  async logSecurityEvent(event = {}) {
    return this.logAuditEvent({ ...event, severity: event.severity || "SECURITY" });
  },

  async logSystemEvent(event = {}) {
    return this.logAuditEvent({ ...event, module: event.module || "system", severity: event.severity || "INFO" });
  },

  async logDatabaseMigration(metadata = {}) {
    return this.logSystemEvent({
      action: "database_migration",
      entity: "database",
      metadata,
      result: metadata.result || "success",
      message: metadata.message || "Database migration recorded.",
    });
  },

  initializeRuntime(options = {}) {
    if (typeof window === "undefined" || window[RUNTIME_AUDIT_FLAG]) return;
    window[RUNTIME_AUDIT_FLAG] = true;
    const version = options.version || "0.0.0";
    const source = options.source || "web";
    const correlationId = createUuid();

    this.logSystemEvent({
      action: "build_version",
      source,
      correlationId,
      versionNumber: version,
      entity: "application",
      metadata: {
        message: `Build version ${version}`,
        version_number: version,
      },
    }).catch(() => {
      // Ignore initialization audit failures.
    });

    this.logSystemEvent({
      action: "system_startup",
      source,
      correlationId,
      versionNumber: version,
      entity: "application",
      metadata: {
        message: "System startup recorded.",
        version_number: version,
      },
    }).catch(() => {
      // Ignore initialization audit failures.
    });

    window.addEventListener("beforeunload", () => {
      this.logSystemEvent({
        action: "system_shutdown",
        source,
        versionNumber: version,
        entity: "application",
        metadata: {
          message: "System shutdown recorded.",
          version_number: version,
        },
      }).catch(() => {
        // Ignore shutdown audit failures.
      });
    });
  },

  async queryAuditLogs(options = {}) {
    const filters = options.filters && typeof options.filters === "object" ? options.filters : {};
    const page = Math.max(1, Number(options.page || 1));
    const pageSize = Math.max(1, Number(options.pageSize || 25));
    const sortBy = options.sortBy || "timestamp";
    const sortOrder = options.sortOrder || "desc";

    let rows = [];
    if (SUPABASE_ENABLED) {
      try {
        const { data, error } = await supabase
          .from("auth_audit_logs")
          .select("id, action, user_id, email, status, source, metadata, event_time, created_at")
          .order("event_time", { ascending: false })
          .limit(1000);

        if (!error && Array.isArray(data)) {
          rows = data.map((row) => mapStoredRowToAudit(row));
        }
      } catch {
        // Fall back to local cache.
      }
    }

    if (rows.length === 0) {
      rows = readLocalLogs().map((row) => mapStoredRowToAudit(row));
    }

    const merged = [...rows, ...readLegacyAdminLogs().map((row) => mapLegacyAdminRowToAudit(row))];
    const unique = Object.values(
      merged.reduce((accumulator, row) => {
        accumulator[row.auditUuid] = row;
        return accumulator;
      }, {})
    );
    const filtered = applyFilters(unique, filters);
    const sorted = sortAuditRows(filtered, sortBy, sortOrder);
    const start = (page - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize);

    return {
      items,
      total: sorted.length,
      page,
      pageSize,
      hasMore: start + pageSize < sorted.length,
      sortingReady: true,
      paginationReady: true,
      exportReady: true,
    };
  },

  async getAdminAuditEvents(limit = 500) {
    const result = await this.queryAuditLogs({
      filters: {},
      page: 1,
      pageSize: limit,
      sortBy: "timestamp",
      sortOrder: "desc",
    });

    return result.items
      .filter((row) => ADMIN_MODULES.has(row.module))
      .slice(0, limit)
      .map((row) => ({
        id: row.auditUuid,
        action: row.action,
        actor_user_id: row.actorUuid || null,
        target_email: row.email || null,
        notes: row.failureReason || "",
        message: row.message || row.action,
        timestamp: row.timestamp,
      }));
  },
};

export default AuditLogService;
