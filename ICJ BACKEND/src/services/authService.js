import { SUPABASE_ENABLED, supabase } from "./supabase";
import {
  getLegacyRole,
  getRoleCategory,
  isPublicRegistrationRole,
  normalizeRoleCode,
  resolveRoleCode,
} from "../core/roles";
import { hasPermission } from "../core/permissions";
import AuditLogService from "./auditLogService";
import PersonService from "./personService";
import OrganizationService from "./organizationService";
import OtpService from "./auth/otpService";
import {
  AUTH_ACCOUNT_LOCK_FAILED_ATTEMPTS,
  AUTH_ACCOUNT_LOCK_DURATION_MINUTES,
  AUTH_BRUTE_FORCE_MAX_FAILED_ATTEMPTS,
  AUTH_BRUTE_FORCE_WINDOW_MINUTES,
  AUTH_DEVICE_STALE_DAYS,
  AUTH_LOGIN_MAX_ATTEMPTS,
  AUTH_LOGIN_WINDOW_MINUTES,
  AUTH_REGISTRATION_MAX_ATTEMPTS,
  AUTH_REGISTRATION_WINDOW_MINUTES,
  AUTH_RISK_BLOCK_THRESHOLD,
  AUTH_SESSION_IDLE_UPDATE_SECONDS,
  ENABLE_ACCOUNT_LOCKOUT,
  ENABLE_ADAPTIVE_RISK_BLOCK,
  ENABLE_ADAPTIVE_RISK_SCORING,
  ENABLE_BRUTE_FORCE_PROTECTION,
  ENABLE_DEVICE_REGISTRY,
  ENABLE_DEVICE_REMOTE_LOGOUT,
  ENABLE_LOGIN_RATE_LIMIT,
  ENABLE_REGISTRATION_RATE_LIMIT,
  ENABLE_SESSION_GLOBAL_REVOKE,
  ENABLE_SESSION_INVENTORY,
} from "../config/auth.config";
import {
  assertIndianMobile,
  assertStrongPassword,
  getPasswordPolicyMessage,
  normalizeEmail,
  normalizeIndianMobile,
  validateRegistrationForm,
} from "./auth/registrationValidation";

const SESSION_KEY = "icj_user";
const USERS_KEY = "icj_members";
const RECOVERY_REQUESTS_KEY = "icj_recovery_requests";
const RECOVERY_TOKENS_KEY = "icj_recovery_tokens";
const SECURITY_CONTROLS_KEY = "icj_auth_security_controls";
const SESSION_INVENTORY_KEY = "icj_auth_session_inventory";
const DEVICE_REGISTRY_KEY = "icj_trusted_device_registry";
const CURRENT_SESSION_REFERENCE_KEY = "icj_current_session_reference";
const CURRENT_DEVICE_REFERENCE_KEY = "icj_current_device_reference";
const ACTIVE_ORGANIZATION_KEY = "icj_active_organization";
const RECOVERY_TOKEN_TTL_MINUTES = 15;
const RECOVERY_TOKEN_MAX_ATTEMPTS = 5;
const SESSION_STATUS_ACTIVE = "ACTIVE";
const SESSION_STATUS_REVOKED = "REVOKED";
const SESSION_STATUS_LOGGED_OUT = "LOGGED_OUT";
const DEVICE_TRUST_TRUSTED = "TRUSTED";
const DEVICE_TRUST_REVOKED = "REVOKED";
const DEVICE_TRUST_UNTRUSTED = "UNTRUSTED";
const BLOCKED_ACCOUNT_STATUSES = new Set(["REJECTED", "SUSPENDED"]);

const isSupabaseConfigured = SUPABASE_ENABLED;
const allowMockAuth = !import.meta.env.PROD && import.meta.env.VITE_ENABLE_MOCK_AUTH === "true";
const strictAuthMode = import.meta.env.VITE_AUTH_STRICT_MODE !== "false";

const resolveVerificationFlags = (profile = null, user = null) => {
  const metadata = user?.user_metadata || user?.profile?.user_metadata || {};
  const emailVerified = Boolean(
    profile?.email_verified ??
    profile?.is_email_verified ??
    metadata.email_verified ??
    metadata.is_email_verified ??
    user?.email_confirmed_at
  );
  const mobileVerified = Boolean(
    profile?.mobile_verified ??
    profile?.is_mobile_verified ??
    metadata.mobile_verified ??
    metadata.is_mobile_verified
  );

  return { emailVerified, mobileVerified };
};

const ensureRegistrationPayload = (payload = {}) => {
  const fullName = String(payload.fullName || payload.name || "").trim();
  const dateOfBirth = String(payload.dateOfBirth || payload.dob || "").trim();
  const memberType = String(payload.memberType || payload.member_type || "").trim();
  const pinCode = String(payload.pinCode || payload.pincode || "").trim();
  const postOffice = String(payload.postOffice || payload.post_office || "").trim();
  const needServices = String(payload.needServices || payload.need_services || payload.purpose || "receive").trim() || "receive";
  const provideServices = String(payload.provideServices || payload.provide_services || "").trim();
  const registrationDocument = String(payload.registrationDocument || payload.registration_document || "").trim();
  const computeAge = (value) => {
    if (!value) return null;
    const dob = new Date(value);
    if (Number.isNaN(dob.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
      age -= 1;
    }
    return age >= 0 ? age : null;
  };

  const normalized = {
    ...payload,
    fullName,
    email: normalizeEmail(payload.email),
    mobile: assertIndianMobile(payload.mobile),
    password: assertStrongPassword(payload.password),
    dateOfBirth,
    dob: dateOfBirth,
    memberType: memberType || "Individual",
    pinCode,
    whatsapp: normalizeIndianMobile(payload.whatsapp || "") || "",
    profession: String(payload.profession || "").trim(),
    organisation: String(payload.organisation || payload.organization || "").trim(),
    designation: String(payload.designation || "").trim(),
    remarks: String(payload.remarks || "").trim(),
    postOffice,
    needServices,
    provideServices: provideServices || (needServices === "receive" ? "no" : "yes"),
    serviceCategory: String(payload.serviceCategory || payload.service_category || "").trim(),
    availability: String(payload.availability || "").trim(),
    signature: String(payload.signature || "").trim(),
    registrationDocument,
    registrationDocumentName: String(payload.registrationDocumentName || payload.registration_document_name || "").trim(),
    registrationDocumentType: String(payload.registrationDocumentType || payload.registration_document_type || "").trim(),
    registrationDocumentSize: Number(payload.registrationDocumentSize || payload.registration_document_size || 0),
    purpose: needServices,
    age: computeAge(dateOfBirth),
  };

  const errors = validateRegistrationForm(normalized);
  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors) {
    throw new Error(Object.values(errors)[0]);
  }

  return normalized;
};

const safeAudit = async (event) => {
  try {
    await AuditLogService.logAuthEvent(event);
  } catch {
    // Ignore audit write failures to keep auth flow non-blocking.
  }
};

const getSecurityControls = () => {
  const rows = readJson(SECURITY_CONTROLS_KEY, []);
  return Array.isArray(rows) ? rows : [];
};

const saveSecurityControls = (rows) => {
  writeJson(SECURITY_CONTROLS_KEY, rows);
};

const toSecurityIdentityKey = ({ email = "", mobile = "" } = {}) => {
  const normalizedEmail = email ? normalizeEmail(email) : "";
  if (normalizedEmail) return `email:${normalizedEmail}`;
  const normalizedMobile = mobile ? normalizeIndianMobile(mobile) : "";
  if (normalizedMobile) return `mobile:${normalizedMobile}`;
  return "anonymous";
};

const minutesToMilliseconds = (value) => Math.max(1, Number(value || 1)) * 60 * 1000;

const parseDateValue = (value) => {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

const normalizeSecurityControl = (row = {}, identity = {}) => {
  const identityKey = row.identity_key || toSecurityIdentityKey(identity);
  return {
    identity_key: identityKey,
    user_id: row.user_id || null,
    email: row.email || normalizeEmail(identity.email || "") || null,
    mobile: row.mobile || normalizeIndianMobile(identity.mobile || "") || null,
    registration_attempt_count: Number(row.registration_attempt_count || 0),
    registration_window_started_at: row.registration_window_started_at || null,
    login_attempt_count: Number(row.login_attempt_count || 0),
    login_window_started_at: row.login_window_started_at || null,
    failed_login_attempt_count: Number(row.failed_login_attempt_count || 0),
    failed_window_started_at: row.failed_window_started_at || null,
    lockout_until: row.lockout_until || null,
    last_risk_score: Number(row.last_risk_score || 0),
    last_risk_level: row.last_risk_level || "LOW",
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
};

const upsertSecurityControlFallback = (nextRow) => {
  const controls = getSecurityControls();
  const index = controls.findIndex((row) => row.identity_key === nextRow.identity_key);
  if (index === -1) {
    saveSecurityControls([nextRow, ...controls]);
    return nextRow;
  }

  controls[index] = { ...controls[index], ...nextRow };
  saveSecurityControls(controls);
  return controls[index];
};

const readSecurityControlFallback = (identity = {}) => {
  const identityKey = toSecurityIdentityKey(identity);
  const controls = getSecurityControls();
  const row = controls.find((item) => item.identity_key === identityKey);
  return normalizeSecurityControl(row || { identity_key: identityKey }, identity);
};

const readSecurityControl = async (identity = {}) => {
  const identityKey = toSecurityIdentityKey(identity);
  if (!isSupabaseConfigured || identityKey === "anonymous") {
    return readSecurityControlFallback(identity);
  }

  try {
    const { data, error } = await supabase
      .from("auth_security_controls")
      .select("*")
      .eq("identity_key", identityKey)
      .maybeSingle();
    if (error) throw error;
    return normalizeSecurityControl(data || { identity_key: identityKey }, identity);
  } catch {
    return readSecurityControlFallback(identity);
  }
};

const persistSecurityControl = async (row = {}) => {
  const nextRow = normalizeSecurityControl({
    ...row,
    updated_at: new Date().toISOString(),
  });

  if (!isSupabaseConfigured || nextRow.identity_key === "anonymous") {
    return upsertSecurityControlFallback(nextRow);
  }

  try {
    const { data, error } = await supabase
      .from("auth_security_controls")
      .upsert([nextRow], { onConflict: "identity_key" })
      .select("*")
      .single();
    if (error) throw error;
    return normalizeSecurityControl(data || nextRow);
  } catch {
    return upsertSecurityControlFallback(nextRow);
  }
};

const listLockedControls = async () => {
  const nowIso = new Date().toISOString();
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("auth_security_controls")
        .select("*")
        .gt("lockout_until", nowIso)
        .order("lockout_until", { ascending: false });
      if (error) throw error;
      return Array.isArray(data) ? data.map((row) => normalizeSecurityControl(row)) : [];
    } catch {
      // Fall through to local fallback.
    }
  }

  return getSecurityControls()
    .map((row) => normalizeSecurityControl(row))
    .filter((row) => parseDateValue(row.lockout_until) && parseDateValue(row.lockout_until) > Date.now());
};

const unlockSecurityControl = async (identity = {}, adminNotes = "") => {
  const row = await readSecurityControl(identity);
  const updated = {
    ...row,
    failed_login_attempt_count: 0,
    failed_window_started_at: null,
    lockout_until: null,
    metadata: {
      ...row.metadata,
      last_unlock_notes: String(adminNotes || "").trim(),
      last_unlock_at: new Date().toISOString(),
    },
  };
  return persistSecurityControl(updated);
};

const upsertSessionRecordFallback = (row = {}) => {
  const next = normalizeSessionRecord(row);
  const rows = getSessionInventoryFallback();
  const index = rows.findIndex((item) => item.session_reference === next.session_reference);
  if (index === -1) {
    saveSessionInventoryFallback([next, ...rows]);
    return next;
  }

  rows[index] = { ...rows[index], ...next };
  saveSessionInventoryFallback(rows);
  return rows[index];
};

const upsertSessionRecord = async (row = {}) => {
  const next = normalizeSessionRecord({ ...row, updated_at: new Date().toISOString() });
  if (!isSupabaseConfigured) {
    return upsertSessionRecordFallback(next);
  }

  try {
    const { data, error } = await supabase
      .from("auth_session_inventory")
      .upsert([next], { onConflict: "session_reference" })
      .select("*")
      .single();
    if (error) throw error;
    return normalizeSessionRecord(data || next);
  } catch {
    return upsertSessionRecordFallback(next);
  }
};

const getSessionRecordByReference = async (sessionReference = "") => {
  const value = String(sessionReference || "").trim();
  if (!value) return null;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("auth_session_inventory")
        .select("*")
        .eq("session_reference", value)
        .maybeSingle();
      if (error) throw error;
      return data ? normalizeSessionRecord(data) : null;
    } catch {
      // Fall through to local fallback.
    }
  }

  const rows = getSessionInventoryFallback();
  const row = rows.find((item) => item.session_reference === value);
  return row ? normalizeSessionRecord(row) : null;
};

const listSessionRecords = async ({ userId = null, activeOnly = false } = {}) => {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from("auth_session_inventory")
        .select("*")
        .order("last_activity_at", { ascending: false });

      if (userId) query = query.eq("user_id", userId);
      if (activeOnly) query = query.eq("status", SESSION_STATUS_ACTIVE);

      const { data, error } = await query;
      if (error) throw error;
      return Array.isArray(data) ? data.map((row) => normalizeSessionRecord(row)) : [];
    } catch {
      // Fall through to local fallback.
    }
  }

  return getSessionInventoryFallback()
    .map((row) => normalizeSessionRecord(row))
    .filter((row) => (!userId || row.user_id === userId) && (!activeOnly || row.status === SESSION_STATUS_ACTIVE))
    .sort((a, b) => new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime());
};

const updateSessionStatus = async ({
  sessionReference,
  status,
  revokedBy = null,
  revokeReason = null,
  markLogout = false,
} = {}) => {
  const existing = await getSessionRecordByReference(sessionReference);
  if (!existing) return null;

  const nowIso = new Date().toISOString();
  const next = await upsertSessionRecord({
    ...existing,
    status: normalizeSessionStatus(status),
    logout_at: markLogout ? nowIso : existing.logout_at,
    revoked_at: status === SESSION_STATUS_REVOKED ? nowIso : existing.revoked_at,
    revoked_by: status === SESSION_STATUS_REVOKED ? revokedBy : existing.revoked_by,
    revoke_reason: status === SESSION_STATUS_REVOKED ? revokeReason || existing.revoke_reason : existing.revoke_reason,
    updated_at: nowIso,
  });

  if (normalizeSessionStatus(status) === "EXPIRED" && existing.status !== "EXPIRED") {
    await safeAudit({
      action: "session_expired",
      userId: next?.user_id || existing.user_id,
      email: next?.email || existing.email,
      source: "web",
      status: "expired",
      metadata: {
        session_reference: sessionReference,
        message: "Session expired.",
      },
    });
  }

  return next;
};

const buildSessionReferenceFromSession = async (session = null, userId = "") => {
  const tokenSource = String(`${userId}:${session?.access_token || session?.refresh_token || Date.now()}`);
  const tokenHash = await hashToken(tokenSource);
  return `SREF-${String(tokenHash).slice(0, 28)}`;
};

const registerTrustedDeviceForSession = async ({
  userId,
  email,
  metadata,
  sessionReference,
  source = "web",
} = {}) => {
  if (!ENABLE_DEVICE_REGISTRY || !userId) return null;

  const deviceReference = await buildDeviceReference({ userId, metadata });
  const existing = await getTrustedDeviceByReference({ userId, deviceReference });
  const trustStatus = existing?.trust_status || DEVICE_TRUST_TRUSTED;
  const securityControl = await readSecurityControl({ email: email || "" });
  const riskStatus = computeDeviceRiskStatus(securityControl, trustStatus);

  const device = await upsertTrustedDevice({
    device_reference: deviceReference,
    user_id: userId,
    email: email || null,
    device_name: metadata.deviceName,
    browser_name: metadata.browserName,
    os_name: metadata.osName,
    device_type: metadata.deviceType,
    first_login_at: existing?.first_login_at || new Date().toISOString(),
    last_login_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
    trust_status: trustStatus,
    risk_status: riskStatus,
    user_agent: metadata.userAgent,
    platform: metadata.platform,
    language: metadata.language,
    timezone: metadata.timezone,
    ip_address: metadata.ipAddress,
    client_fingerprint: metadata.clientFingerprint,
    mfa_required: false,
    mfa_enrolled: Boolean(existing?.mfa_enrolled),
    metadata: {
      ...(existing?.metadata || {}),
      last_session_reference: sessionReference || null,
      last_source: source,
      mfa_ready: true,
    },
  });

  setCurrentDeviceReference(device.device_reference);

  if (!existing) {
    await safeAudit({
      action: "device_registered",
      userId,
      email,
      source,
      metadata: {
        device_reference: device.device_reference,
        device_name: device.device_name,
        browser_name: device.browser_name,
        os_name: device.os_name,
        trust_status: device.trust_status,
        risk_status: device.risk_status,
      },
    });
  }

  return device;
};

const touchTrustedDeviceActivity = async ({ userId = null, deviceReference = "" } = {}) => {
  if (!ENABLE_DEVICE_REGISTRY || !userId || !deviceReference) return null;
  const existing = await getTrustedDeviceByReference({ userId, deviceReference });
  if (!existing) return null;

  const nowIso = new Date().toISOString();
  const updated = await upsertTrustedDevice({
    ...existing,
    last_activity_at: nowIso,
  });

  await safeAudit({
    action: "device_activity",
    userId,
    email: existing.email,
    source: "web",
    metadata: {
      device_reference: deviceReference,
      last_activity_at: nowIso,
    },
  });

  return updated;
};

const revokeDeviceLinkedSessions = async ({
  userId,
  deviceReference,
  revokedBy,
  reason,
  source = "admin",
} = {}) => {
  const sessions = await listSessionRecords({ userId, activeOnly: true });
  const targets = sessions.filter((row) => row.device_reference === deviceReference);

  for (const row of targets) {
    await updateSessionStatus({
      sessionReference: row.session_reference,
      status: SESSION_STATUS_REVOKED,
      revokedBy,
      revokeReason: reason,
    });
  }

  await safeAudit({
    action: "device_remote_logout",
    userId,
    source,
    status: "success",
    metadata: {
      device_reference: deviceReference,
      affected_sessions: targets.map((row) => row.session_reference),
      affected_count: targets.length,
    },
  });

  return targets.length;
};

const registerSessionInventory = async (result = null, options = {}) => {
  if (!ENABLE_SESSION_INVENTORY) return null;
  const userId = result?.user?.id || null;
  if (!userId) return null;

  const metadata = getClientSessionMetadata(options.client || {});
  const sessionReference = options.sessionReference || (await buildSessionReferenceFromSession(result?.session, userId));
  const trustedDevice = await registerTrustedDeviceForSession({
    userId,
    email: result?.user?.email || result?.profile?.email || null,
    metadata,
    sessionReference,
    source: options.source || "web",
  });
  const existing = await getSessionRecordByReference(sessionReference);
  const row = await upsertSessionRecord({
    session_reference: sessionReference,
    user_id: userId,
    email: result?.user?.email || result?.profile?.email || null,
    status: SESSION_STATUS_ACTIVE,
    login_at: options.loginAt || new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
    device_type: metadata.deviceType,
    browser_name: metadata.browserName,
    os_name: metadata.osName,
    user_agent: metadata.userAgent,
    platform: metadata.platform,
    language: metadata.language,
    timezone: metadata.timezone,
    ip_address: metadata.ipAddress,
    client_fingerprint: metadata.clientFingerprint,
    device_reference: trustedDevice?.device_reference || null,
    device_name: trustedDevice?.device_name || metadata.deviceName,
    device_trust_status: trustedDevice?.trust_status || DEVICE_TRUST_TRUSTED,
    device_risk_status: trustedDevice?.risk_status || "LOW",
    metadata: {
      source: options.source || "web",
    },
  });
  setCurrentSessionReference(row.session_reference);

  if (!existing) {
    await safeAudit({
      action: "session_created",
      userId,
      email: row.email,
      source: "web",
      metadata: {
        session_reference: row.session_reference,
        device_reference: row.device_reference,
        device_name: row.device_name,
        device_type: row.device_type,
        browser_name: row.browser_name,
        os_name: row.os_name,
        ip_address: row.ip_address,
        status: row.status,
      },
    });
  }

  return row;
};

const touchSessionActivity = async (sessionReference = "") => {
  if (!ENABLE_SESSION_INVENTORY) return null;
  const existing = await getSessionRecordByReference(sessionReference);
  if (!existing) return null;

  const now = Date.now();
  const last = parseDateValue(existing.last_activity_at) || 0;
  const minIntervalMs = Math.max(1, AUTH_SESSION_IDLE_UPDATE_SECONDS) * 1000;
  if (now - last < minIntervalMs) return existing;

  const updated = await upsertSessionRecord({
    ...existing,
    last_activity_at: new Date(now).toISOString(),
  });

  await touchTrustedDeviceActivity({
    userId: updated.user_id,
    deviceReference: updated.device_reference,
  });

  await safeAudit({
    action: "session_activity",
    userId: updated.user_id,
    email: updated.email,
    source: "web",
    metadata: {
      session_reference: updated.session_reference,
      last_activity_at: updated.last_activity_at,
    },
  });

  return updated;
};

const ensureCurrentSessionIsActive = async () => {
  if (!ENABLE_SESSION_INVENTORY) return true;
  const reference = getCurrentSessionReference();
  if (!reference) return true;
  const row = await getSessionRecordByReference(reference);
  if (!row) return true;
  if (row.status === SESSION_STATUS_ACTIVE) return true;

  try {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  } catch {
    // Continue cleanup.
  }
  clearKey(SESSION_KEY);
  clearKey(CURRENT_SESSION_REFERENCE_KEY);
  clearKey(CURRENT_DEVICE_REFERENCE_KEY);
  return false;
};

const ensureCurrentDeviceIsTrusted = async () => {
  if (!ENABLE_DEVICE_REGISTRY) return true;
  const user = getSessionUser()?.user;
  if (!user?.id) return true;

  let deviceReference = getCurrentDeviceReference();
  if (!deviceReference) {
    const sessionReference = getCurrentSessionReference();
    const row = sessionReference ? await getSessionRecordByReference(sessionReference) : null;
    deviceReference = row?.device_reference || "";
    if (deviceReference) setCurrentDeviceReference(deviceReference);
  }
  if (!deviceReference) return true;

  const device = await getTrustedDeviceByReference({ userId: user.id, deviceReference });
  if (!device || device.trust_status !== DEVICE_TRUST_REVOKED) return true;

  try {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  } catch {
    // Continue cleanup.
  }

  clearKey(SESSION_KEY);
  clearKey(CURRENT_SESSION_REFERENCE_KEY);
  clearKey(CURRENT_DEVICE_REFERENCE_KEY);
  return false;
};

const revokeTrustedDevice = async ({
  actorUserId,
  actorSource = "web",
  userId,
  deviceReference,
  reason,
} = {}) => {
  const existing = await getTrustedDeviceByReference({ userId, deviceReference });
  if (!existing) {
    throw new Error("Trusted device not found.");
  }

  const updated = await upsertTrustedDevice({
    ...existing,
    trust_status: DEVICE_TRUST_REVOKED,
    risk_status: "HIGH",
    revoked_at: new Date().toISOString(),
    revoked_by: actorUserId || null,
    revoke_reason: String(reason || "").trim() || "Device revoked",
    metadata: {
      ...existing.metadata,
      mfa_ready: true,
    },
  });

  let affectedCount = 0;
  if (ENABLE_DEVICE_REMOTE_LOGOUT) {
    affectedCount = await revokeDeviceLinkedSessions({
      userId,
      deviceReference,
      revokedBy: actorUserId || null,
      reason: updated.revoke_reason,
      source: actorSource,
    });
  }

  return { updated, affectedCount };
};

const applyWindowCounter = (currentCount, startedAt, windowMinutes) => {
  const now = Date.now();
  const start = parseDateValue(startedAt);
  const windowMs = minutesToMilliseconds(windowMinutes);
  if (!start || now - start > windowMs) {
    return {
      count: 1,
      startedAt: new Date(now).toISOString(),
    };
  }

  return {
    count: Number(currentCount || 0) + 1,
    startedAt: new Date(start).toISOString(),
  };
};

const evaluateRiskLevel = (score) => {
  if (score >= 85) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
};

const buildRiskScore = ({ context = "login", control = {}, rateCount = 0, failedCount = 0 }) => {
  let score = 0;
  const factors = [];

  if (context === "registration") {
    if (rateCount >= Math.max(1, AUTH_REGISTRATION_MAX_ATTEMPTS - 1)) {
      score += 35;
      factors.push("registration_rate_near_limit");
    }
    if (rateCount >= AUTH_REGISTRATION_MAX_ATTEMPTS) {
      score += 30;
      factors.push("registration_rate_limit_exceeded");
    }
  }

  if (context === "login") {
    if (rateCount >= Math.max(1, AUTH_LOGIN_MAX_ATTEMPTS - 2)) {
      score += 25;
      factors.push("login_rate_near_limit");
    }
    if (failedCount >= Math.max(1, AUTH_BRUTE_FORCE_MAX_FAILED_ATTEMPTS - 1)) {
      score += 35;
      factors.push("failed_attempts_near_threshold");
    }

    const lockoutUntil = parseDateValue(control.lockout_until);
    if (lockoutUntil && lockoutUntil > Date.now()) {
      score += 40;
      factors.push("active_lockout");
    }
  }

  const level = evaluateRiskLevel(score);
  return { score, level, factors };
};

const isCredentialError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("invalid email") ||
    message.includes("invalid password") ||
    message.includes("invalid login") ||
    message.includes("invalid credentials") ||
    message.includes("role does not match")
  );
};

const tryNormalizeIndianMobile = (value = "") => {
  try {
    return normalizeIndianMobile(value);
  } catch {
    return "";
  }
};

const resolveLoginIdentity = (payload = {}) => {
  const identifier = String(
    payload?.loginId ??
    payload?.identifier ??
    payload?.email ??
    payload?.mobile ??
    payload?.memberId ??
    ""
  ).trim();

  const email = normalizeEmail(identifier);
  const mobile = email ? "" : tryNormalizeIndianMobile(identifier);
  const memberId = email || mobile ? "" : identifier.toUpperCase();

  return { identifier, email, mobile, memberId };
};

const runRegistrationSecurityChecks = async (payload = {}) => {
  const identity = {
    email: normalizeEmail(payload?.email || ""),
    mobile: normalizeIndianMobile(payload?.mobile || ""),
  };
  let control = await readSecurityControl(identity);

  if (ENABLE_REGISTRATION_RATE_LIMIT) {
    const counter = applyWindowCounter(
      control.registration_attempt_count,
      control.registration_window_started_at,
      AUTH_REGISTRATION_WINDOW_MINUTES
    );
    control = {
      ...control,
      registration_attempt_count: counter.count,
      registration_window_started_at: counter.startedAt,
      email: control.email || identity.email || null,
      mobile: control.mobile || identity.mobile || null,
    };
    await persistSecurityControl(control);

    if (counter.count > AUTH_REGISTRATION_MAX_ATTEMPTS) {
      await safeAudit({
        action: "security_registration_rate_limited",
        email: identity.email || null,
        source: "web",
        status: "blocked",
        metadata: {
          identity_key: control.identity_key,
          attempts: counter.count,
          window_minutes: AUTH_REGISTRATION_WINDOW_MINUTES,
          max_attempts: AUTH_REGISTRATION_MAX_ATTEMPTS,
        },
      });
      throw new Error("Too many registration attempts. Please try again later.");
    }
  }

  if (ENABLE_ADAPTIVE_RISK_SCORING) {
    const risk = buildRiskScore({
      context: "registration",
      control,
      rateCount: control.registration_attempt_count,
      failedCount: control.failed_login_attempt_count,
    });
    control = await persistSecurityControl({
      ...control,
      last_risk_score: risk.score,
      last_risk_level: risk.level,
      metadata: {
        ...control.metadata,
        last_risk_context: "registration",
        last_risk_factors: risk.factors,
      },
    });

    await safeAudit({
      action: "security_risk_scored",
      email: identity.email || null,
      source: "web",
      metadata: {
        identity_key: control.identity_key,
        context: "registration",
        risk_score: risk.score,
        risk_level: risk.level,
        factors: risk.factors,
      },
    });

    if (ENABLE_ADAPTIVE_RISK_BLOCK && risk.score >= AUTH_RISK_BLOCK_THRESHOLD) {
      throw new Error("Registration is temporarily blocked due to elevated risk.");
    }
  }

  return control;
};

const runLoginSecurityChecks = async (payload = {}) => {
  const loginIdentity = resolveLoginIdentity(payload);
  const identity = {
    email: loginIdentity.email,
    mobile: loginIdentity.mobile,
  };
  let control = await readSecurityControl(identity);
  const lockoutUntil = parseDateValue(control.lockout_until);
  if (ENABLE_ACCOUNT_LOCKOUT && lockoutUntil && lockoutUntil > Date.now()) {
    const lockMinutes = Math.max(1, Math.ceil((lockoutUntil - Date.now()) / (60 * 1000)));
    await safeAudit({
      action: "security_account_lockout",
      email: identity.email || null,
      source: "web",
      status: "blocked",
      metadata: {
        identity_key: control.identity_key,
        lockout_until: control.lockout_until,
        remaining_minutes: lockMinutes,
      },
    });
    throw new Error(`Account temporarily locked. Try again in ${lockMinutes} minute(s).`);
  }

  if (ENABLE_LOGIN_RATE_LIMIT) {
    const counter = applyWindowCounter(
      control.login_attempt_count,
      control.login_window_started_at,
      AUTH_LOGIN_WINDOW_MINUTES
    );
    control = {
      ...control,
      login_attempt_count: counter.count,
      login_window_started_at: counter.startedAt,
      email: control.email || identity.email || null,
      mobile: control.mobile || identity.mobile || null,
    };
    await persistSecurityControl(control);

    if (counter.count > AUTH_LOGIN_MAX_ATTEMPTS) {
      await safeAudit({
        action: "security_login_rate_limited",
        email: identity.email || null,
        source: "web",
        status: "blocked",
        metadata: {
          identity_key: control.identity_key,
          attempts: counter.count,
          window_minutes: AUTH_LOGIN_WINDOW_MINUTES,
          max_attempts: AUTH_LOGIN_MAX_ATTEMPTS,
        },
      });
      throw new Error("Too many login attempts. Please try again later.");
    }
  }

  if (ENABLE_ADAPTIVE_RISK_SCORING) {
    const risk = buildRiskScore({
      context: "login",
      control,
      rateCount: control.login_attempt_count,
      failedCount: control.failed_login_attempt_count,
    });
    control = await persistSecurityControl({
      ...control,
      last_risk_score: risk.score,
      last_risk_level: risk.level,
      metadata: {
        ...control.metadata,
        last_risk_context: "login",
        last_risk_factors: risk.factors,
      },
    });

    await safeAudit({
      action: "security_risk_scored",
      email: identity.email || null,
      source: "web",
      metadata: {
        identity_key: control.identity_key,
        context: "login",
        risk_score: risk.score,
        risk_level: risk.level,
        factors: risk.factors,
      },
    });

    if (ENABLE_ADAPTIVE_RISK_BLOCK && risk.score >= AUTH_RISK_BLOCK_THRESHOLD) {
      throw new Error("Login is temporarily blocked due to elevated risk.");
    }
  }

  return control;
};

const onLoginFailedSecurity = async (payload = {}, error, currentControl = null) => {
  if (!isCredentialError(error)) return;

  const loginIdentity = resolveLoginIdentity(payload);
  const identity = {
    email: loginIdentity.email,
    mobile: loginIdentity.mobile,
  };
  let control = currentControl || (await readSecurityControl(identity));
  const failedCounter = applyWindowCounter(
    control.failed_login_attempt_count,
    control.failed_window_started_at,
    AUTH_BRUTE_FORCE_WINDOW_MINUTES
  );
  control = {
    ...control,
    failed_login_attempt_count: failedCounter.count,
    failed_window_started_at: failedCounter.startedAt,
    email: control.email || identity.email || null,
    mobile: control.mobile || identity.mobile || null,
  };

  await safeAudit({
    action: "security_login_failed",
    email: identity.email || null,
    source: "web",
    status: "failed",
    metadata: {
      identity_key: control.identity_key,
      failed_login_attempt_count: failedCounter.count,
      failed_window_minutes: AUTH_BRUTE_FORCE_WINDOW_MINUTES,
    },
  });

  if (ENABLE_BRUTE_FORCE_PROTECTION && failedCounter.count >= AUTH_BRUTE_FORCE_MAX_FAILED_ATTEMPTS) {
    await safeAudit({
      action: "security_bruteforce_detected",
      email: identity.email || null,
      source: "web",
      status: "detected",
      metadata: {
        identity_key: control.identity_key,
        failed_login_attempt_count: failedCounter.count,
        threshold: AUTH_BRUTE_FORCE_MAX_FAILED_ATTEMPTS,
      },
    });
  }

  if (ENABLE_ACCOUNT_LOCKOUT && failedCounter.count >= AUTH_ACCOUNT_LOCK_FAILED_ATTEMPTS) {
    const lockoutUntil = new Date(
      Date.now() + minutesToMilliseconds(AUTH_ACCOUNT_LOCK_DURATION_MINUTES)
    ).toISOString();
    control = {
      ...control,
      lockout_until: lockoutUntil,
    };

    await safeAudit({
      action: "security_account_lockout",
      email: identity.email || null,
      source: "web",
      status: "locked",
      metadata: {
        identity_key: control.identity_key,
        lockout_until: lockoutUntil,
        lock_duration_minutes: AUTH_ACCOUNT_LOCK_DURATION_MINUTES,
        lock_threshold: AUTH_ACCOUNT_LOCK_FAILED_ATTEMPTS,
      },
    });
  }

  await persistSecurityControl(control);
};

const onLoginSuccessSecurity = async (result = null, payload = {}, currentControl = null) => {
  const loginIdentity = resolveLoginIdentity(payload);
  const identity = {
    email: normalizeEmail(result?.user?.email || loginIdentity.email || ""),
    mobile: loginIdentity.mobile,
  };
  const control = currentControl || (await readSecurityControl(identity));
  await persistSecurityControl({
    ...control,
    user_id: result?.user?.id || control.user_id || null,
    email: identity.email || control.email || null,
    mobile: identity.mobile || control.mobile || null,
    failed_login_attempt_count: 0,
    failed_window_started_at: null,
    lockout_until: null,
  });

  await safeAudit({
    action: "security_login_success",
    userId: result?.user?.id || null,
    email: identity.email || null,
    source: "web",
    status: "success",
    metadata: {
      identity_key: toSecurityIdentityKey(identity),
    },
  });
};

const normalizeRegistrationRole = (payload = {}) => {
  const selectedRoleCode = normalizeRoleCode(payload?.roleCode || payload?.role || "member");
  const selectedRoleCategory = getRoleCategory(selectedRoleCode) || "community";
  const legacyRole = getLegacyRole(selectedRoleCode);

  return {
    roleCode: selectedRoleCode,
    roleCategory: selectedRoleCategory,
    legacyRole,
  };
};

const assertPublicRegistrationRole = (payload = {}) => {
  const role = normalizeRegistrationRole(payload);
  if (!isPublicRegistrationRole(role.roleCode)) {
    throw new Error("Selected role cannot be created through public registration.");
  }
  return role;
};

const normalizeLoginRoleCode = (payload = {}) => {
  const selected = payload?.roleCode || payload?.role;
  if (!selected) return "";
  return normalizeRoleCode(selected);
};

const enrichProfileRole = (profile = null, user = null) => {
  const roleCode = resolveRoleCode(profile, user);
  const legacyRole = getLegacyRole(roleCode);
  const roleCategory = getRoleCategory(roleCode);
  const normalizedMobile = profile?.mobile ? normalizeIndianMobile(profile.mobile) : "";
  const { emailVerified, mobileVerified } = resolveVerificationFlags(profile, user);

  return {
    ...(profile || {}),
    role: roleCode,
    role_code: roleCode,
    role_category: roleCategory,
    legacy_role: legacyRole,
    mobile: normalizedMobile,
    email_verified: emailVerified,
    mobile_verified: mobileVerified,
    is_email_verified: emailVerified,
    is_mobile_verified: mobileVerified,
  };
};

const enrichUserRole = (user = null, profile = null) => {
  if (!user) return user;
  return {
    ...user,
    role: profile?.role || resolveRoleCode(profile, user),
    role_code: profile?.role_code || resolveRoleCode(profile, user),
    profile,
  };
};

const readJson = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const clearKey = (key) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
};

const getActiveOrganizationContext = () => {
  const value = readJson(ACTIVE_ORGANIZATION_KEY, null);
  if (!value || typeof value !== "object") return null;
  return value;
};

const setActiveOrganizationContext = (context = null) => {
  if (!context) {
    clearKey(ACTIVE_ORGANIZATION_KEY);
    return;
  }
  writeJson(ACTIVE_ORGANIZATION_KEY, context);
};

const getSessionInventoryFallback = () => {
  const rows = readJson(SESSION_INVENTORY_KEY, []);
  return Array.isArray(rows) ? rows : [];
};

const saveSessionInventoryFallback = (rows) => {
  writeJson(SESSION_INVENTORY_KEY, rows);
};

const setCurrentSessionReference = (value = "") => {
  if (!value) {
    clearKey(CURRENT_SESSION_REFERENCE_KEY);
    return;
  }
  writeJson(CURRENT_SESSION_REFERENCE_KEY, value);
};

const getCurrentSessionReference = () => {
  const value = readJson(CURRENT_SESSION_REFERENCE_KEY, "");
  return typeof value === "string" ? value : "";
};

const getDeviceRegistryFallback = () => {
  const rows = readJson(DEVICE_REGISTRY_KEY, []);
  return Array.isArray(rows) ? rows : [];
};

const saveDeviceRegistryFallback = (rows) => {
  writeJson(DEVICE_REGISTRY_KEY, rows);
};

const setCurrentDeviceReference = (value = "") => {
  if (!value) {
    clearKey(CURRENT_DEVICE_REFERENCE_KEY);
    return;
  }
  writeJson(CURRENT_DEVICE_REFERENCE_KEY, value);
};

const getCurrentDeviceReference = () => {
  const value = readJson(CURRENT_DEVICE_REFERENCE_KEY, "");
  return typeof value === "string" ? value : "";
};

const parseBrowserName = (userAgent = "") => {
  const value = String(userAgent || "");
  if (value.includes("Edg/")) return "Edge";
  if (value.includes("OPR/") || value.includes("Opera")) return "Opera";
  if (value.includes("Chrome/")) return "Chrome";
  if (value.includes("Firefox/")) return "Firefox";
  if (value.includes("Safari/") && !value.includes("Chrome/")) return "Safari";
  return "Unknown";
};

const parseDeviceType = (userAgent = "") => {
  const value = String(userAgent || "").toLowerCase();
  if (/ipad|tablet/.test(value)) return "Tablet";
  if (/mobile|iphone|android/.test(value)) return "Mobile";
  return "Desktop";
};

const parseOsName = (userAgent = "") => {
  const value = String(userAgent || "");
  if (value.includes("Windows")) return "Windows";
  if (value.includes("Mac OS X") || value.includes("Macintosh")) return "macOS";
  if (value.includes("Android")) return "Android";
  if (value.includes("iPhone") || value.includes("iPad")) return "iOS";
  if (value.includes("Linux")) return "Linux";
  return "Unknown";
};

const normalizeDeviceTrustStatus = (value = "") => {
  const raw = String(value || "").toUpperCase();
  if ([DEVICE_TRUST_TRUSTED, DEVICE_TRUST_REVOKED, DEVICE_TRUST_UNTRUSTED].includes(raw)) {
    return raw;
  }
  return DEVICE_TRUST_TRUSTED;
};

const normalizeDeviceRiskStatus = (value = "") => {
  const raw = String(value || "").toUpperCase();
  if (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(raw)) return raw;
  return "LOW";
};

const getClientSessionMetadata = (provided = {}) => {
  const userAgent = String(provided.userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : ""));
  const platform = String(provided.platform || (typeof navigator !== "undefined" ? navigator.platform : ""));
  const language = String(provided.language || (typeof navigator !== "undefined" ? navigator.language : ""));
  const timezone = String(
    provided.timezone ||
    (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "" : "")
  );

  return {
    deviceType: provided.deviceType || parseDeviceType(userAgent),
    browserName: provided.browserName || parseBrowserName(userAgent),
    osName: provided.osName || parseOsName(userAgent),
    deviceName:
      provided.deviceName ||
      `${parseBrowserName(userAgent)} on ${parseOsName(userAgent)} (${parseDeviceType(userAgent)})`,
    userAgent,
    platform,
    language,
    timezone,
    ipAddress: provided.ipAddress || null,
    clientFingerprint: provided.clientFingerprint || null,
  };
};

const normalizeDeviceRecord = (row = {}) => ({
  id: row.id || null,
  device_reference: row.device_reference || "",
  user_id: row.user_id || null,
  email: row.email || null,
  device_name: row.device_name || "Unknown Device",
  browser_name: row.browser_name || "Unknown",
  os_name: row.os_name || "Unknown",
  device_type: row.device_type || "Unknown",
  first_login_at: row.first_login_at || row.last_login_at || new Date().toISOString(),
  last_login_at: row.last_login_at || new Date().toISOString(),
  last_activity_at: row.last_activity_at || row.last_login_at || new Date().toISOString(),
  trust_status: normalizeDeviceTrustStatus(row.trust_status),
  risk_status: normalizeDeviceRiskStatus(row.risk_status),
  revoked_at: row.revoked_at || null,
  revoked_by: row.revoked_by || null,
  revoke_reason: row.revoke_reason || null,
  user_agent: row.user_agent || "",
  platform: row.platform || "",
  language: row.language || "",
  timezone: row.timezone || "",
  ip_address: row.ip_address || null,
  client_fingerprint: row.client_fingerprint || null,
  mfa_required: Boolean(row.mfa_required),
  mfa_enrolled: Boolean(row.mfa_enrolled),
  metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
  is_stale: false,
  created_at: row.created_at || new Date().toISOString(),
  updated_at: row.updated_at || new Date().toISOString(),
});

const isTrustedDeviceStale = (row = {}) => {
  const days = Math.max(1, Number(AUTH_DEVICE_STALE_DAYS || 30));
  const thresholdMs = days * 24 * 60 * 60 * 1000;
  const lastActivity = parseDateValue(row?.last_activity_at || row?.last_login_at);
  if (!lastActivity) return false;
  return Date.now() - lastActivity > thresholdMs;
};

const withStaleDeviceFlag = (row = {}) => ({
  ...row,
  is_stale: isTrustedDeviceStale(row),
});

const upsertTrustedDeviceFallback = (row = {}) => {
  const next = normalizeDeviceRecord(row);
  const rows = getDeviceRegistryFallback();
  const index = rows.findIndex(
    (item) => item.device_reference === next.device_reference && item.user_id === next.user_id
  );
  if (index === -1) {
    saveDeviceRegistryFallback([next, ...rows]);
    return next;
  }

  rows[index] = { ...rows[index], ...next };
  saveDeviceRegistryFallback(rows);
  return rows[index];
};

const upsertTrustedDevice = async (row = {}) => {
  const next = normalizeDeviceRecord({ ...row, updated_at: new Date().toISOString() });
  if (!isSupabaseConfigured) {
    return upsertTrustedDeviceFallback(next);
  }

  try {
    const { data, error } = await supabase
      .from("auth_trusted_devices")
      .upsert([next], { onConflict: "device_reference,user_id" })
      .select("*")
      .single();
    if (error) throw error;
    return normalizeDeviceRecord(data || next);
  } catch {
    return upsertTrustedDeviceFallback(next);
  }
};

const getTrustedDeviceByReference = async ({ userId = null, deviceReference = "" } = {}) => {
  const value = String(deviceReference || "").trim();
  if (!value) return null;

  if (isSupabaseConfigured) {
    try {
      let query = supabase.from("auth_trusted_devices").select("*").eq("device_reference", value);
      if (userId) query = query.eq("user_id", userId);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data ? normalizeDeviceRecord(data) : null;
    } catch {
      // Fall through to local fallback.
    }
  }

  const rows = getDeviceRegistryFallback().map((row) => normalizeDeviceRecord(row));
  const row = rows.find(
    (item) => item.device_reference === value && (!userId || String(item.user_id) === String(userId))
  );
  return row || null;
};

const listTrustedDevices = async ({ userId = null, includeRevoked = true } = {}) => {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from("auth_trusted_devices")
        .select("*")
        .order("last_activity_at", { ascending: false });
      if (userId) query = query.eq("user_id", userId);
      if (!includeRevoked) query = query.neq("trust_status", DEVICE_TRUST_REVOKED);

      const { data, error } = await query;
      if (error) throw error;
      return Array.isArray(data)
        ? data.map((row) => withStaleDeviceFlag(normalizeDeviceRecord(row)))
        : [];
    } catch {
      // Fall through to local fallback.
    }
  }

  return getDeviceRegistryFallback()
    .map((row) => withStaleDeviceFlag(normalizeDeviceRecord(row)))
    .filter(
      (row) =>
        (!userId || String(row.user_id) === String(userId)) &&
        (includeRevoked || row.trust_status !== DEVICE_TRUST_REVOKED)
    )
    .sort((a, b) => new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime());
};

const computeDeviceRiskStatus = (control = null, trustStatus = DEVICE_TRUST_TRUSTED) => {
  if (trustStatus === DEVICE_TRUST_REVOKED) return "HIGH";
  const level = String(control?.last_risk_level || "LOW").toUpperCase();
  if (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(level)) return level;
  return "LOW";
};

const buildDeviceReference = async ({ userId = "", metadata = {} } = {}) => {
  const source = [
    userId,
    metadata.clientFingerprint || "",
    metadata.userAgent || "",
    metadata.platform || "",
    metadata.language || "",
    metadata.osName || "",
  ].join("|");
  const hash = await hashToken(source);
  return `DEV-${String(hash).slice(0, 28)}`;
};

const generateSessionReference = () =>
  `SES-${Date.now()}-${Math.floor(Math.random() * 100000).toString().padStart(5, "0")}`;

const normalizeSessionStatus = (value = "") => {
  const raw = String(value || "").toUpperCase();
  if ([SESSION_STATUS_ACTIVE, SESSION_STATUS_REVOKED, SESSION_STATUS_LOGGED_OUT, "EXPIRED"].includes(raw)) {
    return raw;
  }
  return SESSION_STATUS_ACTIVE;
};

const normalizeSessionRecord = (row = {}) => ({
  id: row.id || null,
  session_reference: row.session_reference || generateSessionReference(),
  user_id: row.user_id || null,
  email: row.email || null,
  status: normalizeSessionStatus(row.status),
  login_at: row.login_at || new Date().toISOString(),
  last_activity_at: row.last_activity_at || row.login_at || new Date().toISOString(),
  logout_at: row.logout_at || null,
  revoked_at: row.revoked_at || null,
  revoked_by: row.revoked_by || null,
  revoke_reason: row.revoke_reason || null,
  device_reference: row.device_reference || null,
  device_name: row.device_name || null,
  device_trust_status: row.device_trust_status || DEVICE_TRUST_TRUSTED,
  device_risk_status: row.device_risk_status || "LOW",
  device_type: row.device_type || "Unknown",
  browser_name: row.browser_name || "Unknown",
  os_name: row.os_name || "Unknown",
  user_agent: row.user_agent || "",
  platform: row.platform || "",
  language: row.language || "",
  timezone: row.timezone || "",
  ip_address: row.ip_address || null,
  client_fingerprint: row.client_fingerprint || null,
  metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
  created_at: row.created_at || new Date().toISOString(),
  updated_at: row.updated_at || new Date().toISOString(),
});

const resolveActorFromSession = () => {
  const cached = getSessionUser();
  const roleCode = normalizeRoleCode(cached?.user?.role_code || cached?.user?.role || cached?.profile?.role_code || "member");
  return {
    userId: cached?.user?.id || null,
    email: cached?.user?.email || cached?.profile?.email || null,
    roleCode,
  };
};

const assertSessionPermission = (permission) => {
  const actor = resolveActorFromSession();
  if (!actor.userId) {
    throw new Error("User session not found.");
  }
  if (!hasPermission(actor.roleCode, permission)) {
    void AuditLogService.logSecurityEvent({
      action: "permission_denied",
      module: "security",
      entity: "session",
      actorUuid: actor.userId,
      actorRole: actor.roleCode,
      result: "failed",
      failureReason: "You do not have permission to perform this session operation.",
      metadata: {
        permission,
      },
    });
    throw new Error("You do not have permission to perform this session operation.");
  }
  return actor;
};

const assertDevicePermission = (permission) => {
  const actor = resolveActorFromSession();
  if (!actor.userId) {
    throw new Error("User session not found.");
  }
  if (!hasPermission(actor.roleCode, permission)) {
    void AuditLogService.logSecurityEvent({
      action: "permission_denied",
      module: "security",
      entity: "device",
      actorUuid: actor.userId,
      actorRole: actor.roleCode,
      result: "failed",
      failureReason: "You do not have permission to perform this device operation.",
      metadata: {
        permission,
      },
    });
    throw new Error("You do not have permission to perform this device operation.");
  }
  return actor;
};

const mapMockProfile = (user) => ({
  id: user.id,
  user_id: user.user_id || user.member_id,
  email: user.email,
  full_name: user.full_name || user.name || "",
  role: user.role || "member",
  member_id: user.member_id || "",
  status: user.status || "Pending",
  member_type: user.member_type || user.memberType || "Individual",
  member_level: user.member_level || "BASIC",
  verification_status: user.verification_status || "Pending",
  is_email_verified: Boolean(user.email_verified ?? user.is_email_verified),
  is_mobile_verified: Boolean(user.mobile_verified ?? user.is_mobile_verified),
  email_verified: Boolean(user.email_verified ?? user.is_email_verified),
  mobile_verified: Boolean(user.mobile_verified ?? user.is_mobile_verified),
  mobile: normalizeIndianMobile(user.mobile || ""),
  profile_photo: user.profile_photo || "",
  date_of_birth: user.date_of_birth || "",
  gender: user.gender || "",
  address: user.address || "",
  city: user.city || "",
  state: user.state || "",
  country: user.country || "India",
  pin_code: user.pin_code || "",
  district: user.district || "",
  referral_code: user.referral_code || "",
  referred_by: user.referred_by || "",
});

const getMockUsers = () => {
  const users = readJson(USERS_KEY, []);
  return Array.isArray(users) ? users : [];
};

const getRecoveryRequests = () => {
  const requests = readJson(RECOVERY_REQUESTS_KEY, []);
  return Array.isArray(requests) ? requests : [];
};

const getRecoveryTokens = () => {
  const tokens = readJson(RECOVERY_TOKENS_KEY, []);
  return Array.isArray(tokens) ? tokens : [];
};

const saveRecoveryRequests = (requests) => {
  writeJson(RECOVERY_REQUESTS_KEY, requests);
};

const saveRecoveryTokens = (tokens) => {
  writeJson(RECOVERY_TOKENS_KEY, tokens);
};

const generateRecoveryRequestNo = () => `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const generateRecoveryTokenReference = () =>
  `RCT-${Date.now()}-${Math.floor(Math.random() * 100000).toString().padStart(5, "0")}`;

const createRecoveryToken = () => {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  // Fallback for constrained runtimes while keeping a non-empty token.
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
};

const hashToken = async (value = "") => {
  const normalized = String(value || "");
  if (typeof crypto !== "undefined" && crypto.subtle && typeof TextEncoder !== "undefined") {
    const encoded = new TextEncoder().encode(normalized);
    const digest = await crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  // Fallback hash surrogate for environments without Web Crypto.
  return normalized
    .split("")
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
    .toString(16);
};

const issueRecoveryTokenLifecycle = async (context = {}) => {
  const rawToken = createRecoveryToken();
  const reference = generateRecoveryTokenReference();
  const expiresAt = new Date(Date.now() + RECOVERY_TOKEN_TTL_MINUTES * 60 * 1000).toISOString();
  const tokenHash = await hashToken(rawToken);

  return {
    request_no: context.requestNo,
    request_type: context.requestType,
    user_id: context.userId || null,
    email: context.email || null,
    mobile: context.mobile || null,
    preferred_channel: context.preferredChannel,
    token_reference: reference,
    token_hash: tokenHash,
    status: "ACTIVE",
    expires_at: expiresAt,
    consumed_at: null,
    attempt_count: 0,
    max_attempts: RECOVERY_TOKEN_MAX_ATTEMPTS,
    metadata: {
      otp_provider: "placeholder",
      otp_channel: context.preferredChannel,
      provider_enabled: false,
      future_delivery_state: "NOT_TRIGGERED",
    },
  };
};

const persistRecoveryTokenFallback = (tokenRecord) => {
  const tokens = getRecoveryTokens();
  saveRecoveryTokens([
    {
      id: `token-${Date.now()}`,
      ...tokenRecord,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    ...tokens,
  ]);
};

const maskEmail = (email = "") => {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@")) return "";
  const [local, domain] = normalized.split("@");
  if (!local) return `***@${domain}`;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, local.length - 2))}@${domain}`;
};

const maskUserId = (userId = "") => {
  const value = String(userId || "").trim();
  if (!value) return "";
  if (value.length <= 6) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 4)}***${value.slice(-2)}`;
};

const normalizeRecoveryType = (value = "") => {
  const raw = String(value || "").trim().toUpperCase();
  if (["FORGOT_USER_ID", "FORGOT_PASSWORD", "ACCOUNT_RECOVERY"].includes(raw)) return raw;
  return "ACCOUNT_RECOVERY";
};

const normalizePreferredChannel = (value = "") => {
  const raw = String(value || "").trim().toLowerCase();
  if (["sms", "whatsapp", "email"].includes(raw)) return raw;
  return "email";
};

const sanitizeRecoveryPayload = (payload = {}) => {
  const email = payload.email ? normalizeEmail(payload.email) : "";
  const mobile = payload.mobile ? assertIndianMobile(payload.mobile) : "";
  if (!email && !mobile) {
    throw new Error("Provide registered email or mobile number.");
  }

  return {
    requestType: normalizeRecoveryType(payload.requestType),
    preferredChannel: normalizePreferredChannel(payload.preferredChannel),
    email,
    mobile,
    reason: String(payload.reason || "").trim(),
    metadata: payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {},
  };
};

const resolveOtpDispatch = async (channel, recipient) => {
  if (!recipient) {
    return { status: "NOT_TRIGGERED", providerStatus: "recipient_missing" };
  }

  if (channel === "email") {
    const dispatch = await OtpService.dispatchEmailOtp(recipient);
    return {
      status: dispatch?.status === "otp_not_enabled" ? "DISABLED" : "FAILED",
      providerStatus: dispatch?.status || "unknown",
      providerMessage: dispatch?.message || "",
    };
  }

  if (channel === "whatsapp") {
    const dispatch = await OtpService.dispatchWhatsAppOtp(recipient);
    return {
      status: dispatch?.status === "otp_not_enabled" ? "DISABLED" : "FAILED",
      providerStatus: dispatch?.status || "unknown",
      providerMessage: dispatch?.message || "",
    };
  }

  const dispatch = await OtpService.dispatchSmsOtp(recipient);
  return {
    status: dispatch?.status === "otp_not_enabled" ? "DISABLED" : "FAILED",
    providerStatus: dispatch?.status || "unknown",
    providerMessage: dispatch?.message || "",
  };
};

const saveMockUsers = (users) => {
  writeJson(USERS_KEY, users);
};

const setSessionUser = (sessionUser) => {
  writeJson(SESSION_KEY, sessionUser);
};

const getSessionUser = () => readJson(SESSION_KEY, null);

const clearExpiredCachedSession = () => {
  const cached = getSessionUser();
  const expiresAt = Number(cached?.session?.expires_at || 0);
  if (!expiresAt) return cached;
  if (Date.now() < expiresAt) return cached;
  clearKey(SESSION_KEY);
  return null;
};

const generateMockUserCode = (users = []) => {
  const year = new Date().getFullYear();
  const maxSerial = users.reduce((max, item) => {
    const value = String(item?.user_id || item?.member_id || "");
    const match = value.match(/^ICJ-(\d{4})-(\d{6})$/);
    if (!match || Number(match[1]) !== year) return max;
    return Math.max(max, Number(match[2]));
  }, 0);

  return `ICJ-${year}-${String(maxSerial + 1).padStart(6, "0")}`;
};

const toAuthResult = (userRecord) => {
  const profile = enrichProfileRole(mapMockProfile(userRecord), userRecord);
  const user = enrichUserRole(
    {
      id: userRecord.id,
      email: userRecord.email,
      role: profile.role,
    },
    profile
  );

  const session = {
    user,
    access_token: "mock-access-token",
    expires_at: Date.now() + 1000 * 60 * 60 * 8,
  };

  return { user, profile, session };
};

const createMockAuthProvider = () => {
  return {
    async register(userData = {}) {
      const normalizedPayload = ensureRegistrationPayload(userData);
      const normalizedRole = assertPublicRegistrationRole(normalizedPayload);
      const users = getMockUsers();
      const email = normalizedPayload.email;
      const mobile = normalizedPayload.mobile;

      if (users.some((user) => user.email.toLowerCase() === email)) {
        throw new Error("User already exists.");
      }

      if (users.some((user) => normalizeIndianMobile(user.mobile) === mobile)) {
        throw new Error("Mobile number is already registered.");
      }

      const generatedUserCode = generateMockUserCode(users);

      const userRecord = {
        id: generatedUserCode,
        user_id: generatedUserCode,
        name: normalizedPayload.fullName,
        email,
        password: normalizedPayload.password,
        full_name: normalizedPayload.fullName,
        role: normalizedRole.roleCode,
        role_code: normalizedRole.roleCode,
        role_category: normalizedRole.roleCategory,
        legacy_role: normalizedRole.legacyRole,
        member_id: generatedUserCode,
        member_type: normalizedPayload.memberType || "Individual",
        member_level: "BASIC",
        verification_status: "Not Verified",
        status: "Pending",
        is_email_verified: false,
        is_mobile_verified: false,
        email_verified: false,
        mobile_verified: false,
        mobile,
        whatsapp: normalizedPayload.whatsapp || "",
        profession: normalizedPayload.profession || "",
        organisation: normalizedPayload.organisation || "",
        designation: normalizedPayload.designation || "",
        remarks: normalizedPayload.remarks || "",
        profile_photo: normalizedPayload.profilePhoto || "",
        signature: normalizedPayload.signature || "",
        registration_document: normalizedPayload.registrationDocument || "",
        registration_document_name: normalizedPayload.registrationDocumentName || "",
        registration_document_type: normalizedPayload.registrationDocumentType || "",
        registration_document_size: normalizedPayload.registrationDocumentSize || 0,
        age: normalizedPayload.age ?? null,
        dob: normalizedPayload.dateOfBirth || "",
        date_of_birth: normalizedPayload.dateOfBirth || "",
        gender: normalizedPayload.gender || "",
        address: normalizedPayload.address || "",
        city: normalizedPayload.city || "",
        state: normalizedPayload.state || "",
        country: normalizedPayload.country || "India",
        pin_code: normalizedPayload.pinCode || "",
        pincode: normalizedPayload.pinCode || "",
        post_office: normalizedPayload.postOffice || "",
        need_services: normalizedPayload.needServices || "receive",
        provide_services: normalizedPayload.provideServices || "no",
        service_category: normalizedPayload.serviceCategory || "",
        availability: normalizedPayload.availability || "",
        purpose: normalizedPayload.needServices || "receive",
        district: normalizedPayload.district || "",
        referral_code: normalizedPayload.referralCode || "",
        referred_by: normalizedPayload.referredBy || "",
        registration_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const canonicalUserRecord = await PersonService.ensureForMemberRecord(userRecord, {
        persist: false,
        roleCode: normalizedRole.roleCode,
      });

      saveMockUsers([canonicalUserRecord, ...users]);
      const result = toAuthResult(canonicalUserRecord);
      setSessionUser(result);
      await safeAudit({
        action: "registration",
        userId: result.user?.id,
        email,
        source: "web",
        metadata: { role_code: normalizedRole.roleCode },
      });
      return result;
    },

    async login(credentials = {}) {
      const users = getMockUsers();
      console.log("MOCK USERS:", users);
      const loginIdentity = resolveLoginIdentity(credentials);
      const { email, mobile, memberId } = loginIdentity;
      const password = String(credentials.password || "");

      if (!loginIdentity.identifier || !password) {
        throw new Error("Login ID and password are required.");
      }

      const userRecord = users.find(
        (user) => {
          const emailMatch = email && normalizeEmail(user.email) === email;
          const mobileMatch = mobile && tryNormalizeIndianMobile(user.mobile) === mobile;
          const memberIdMatch =
            memberId && String(user.member_id || user.user_id || "").trim().toUpperCase() === memberId;
          return (emailMatch || mobileMatch || memberIdMatch) && user.password === password;
        }
      );

      if (!userRecord) {
        await safeAudit({
          action: "login",
          email,
          status: "failed",
          source: "web",
          metadata: { reason: "invalid_credentials" },
        });
        throw new Error("Invalid email or password.");
      }

      const accountStatus = String(userRecord.verification_status || userRecord.status || "").trim().toUpperCase();
      if (BLOCKED_ACCOUNT_STATUSES.has(accountStatus)) {
        throw new Error("This account is suspended or rejected. Please contact the System Admin.");
      }

      const selectedRole = normalizeLoginRoleCode(credentials);
      const canonicalUserRecord = await PersonService.ensureForMemberRecord(userRecord, {
        persist: true,
        roleCode: userRecord.role_code || userRecord.role,
      });
      const availableRoles = PersonService.extractRoleCodes(canonicalUserRecord);
      if (selectedRole && !availableRoles.includes(selectedRole)) {
        throw new Error("Selected role does not match this account.");
      }

      const effectiveRole = selectedRole || resolveRoleCode(canonicalUserRecord, canonicalUserRecord);
      const sessionUserRecord = {
        ...canonicalUserRecord,
        role: effectiveRole,
        role_code: effectiveRole,
      };

      const result = toAuthResult(sessionUserRecord);
      setSessionUser(result);
      await safeAudit({
        action: "login",
        userId: result.user?.id,
        email: result.user?.email || email || null,
        source: "web",
      });
      return result;
    },

    async logout() {
      const cached = getSessionUser();
      clearKey(SESSION_KEY);
      await safeAudit({
        action: "logout",
        userId: cached?.user?.id,
        email: cached?.user?.email,
        source: "web",
      });
    },

    async getCurrentUser() {
      const cached = clearExpiredCachedSession();
      return cached?.user || null;
    },

    async isLoggedIn() {
      return Boolean(clearExpiredCachedSession()?.user);
    },

    async getProfile(userId) {
      const users = getMockUsers();
      const user = users.find((item) => item.id === userId);
      return user ? mapMockProfile(user) : null;
    },

    async updateProfile(userId, updates = {}) {
      const users = getMockUsers();
      const index = users.findIndex((user) => user.id === userId);
      if (index === -1) throw new Error("User not found.");

      users[index] = { ...users[index], ...updates };
      saveMockUsers(users);

      const profile = mapMockProfile(users[index]);
      const cached = getSessionUser();
      if (cached?.user?.id === userId) {
        const result = {
          ...cached,
          user: {
            ...cached.user,
            profile,
          },
          profile,
        };
        setSessionUser(result);
      }

      await safeAudit({
        action: "profile_update",
        userId,
        email: users[index]?.email,
        source: "web",
      });

      return profile;
    },

    async sendMobileOTP(mobile, options = {}) {
      const normalizedMobile = assertIndianMobile(mobile);
      const channel = options.channel === "whatsapp" ? "whatsapp" : "sms";
      if (channel === "whatsapp") {
        return OtpService.dispatchWhatsAppOtp(normalizedMobile);
      }
      return OtpService.dispatchSmsOtp(normalizedMobile);
    },

    async sendWhatsAppOTP(mobile) {
      const normalizedMobile = assertIndianMobile(mobile);
      return OtpService.dispatchWhatsAppOtp(normalizedMobile);
    },

    async verifyMobileOTP(mobile, otp) {
      const normalizedMobile = assertIndianMobile(mobile);
      if (!String(otp || "").trim()) {
        throw new Error("OTP is required.");
      }
      return OtpService.verifyOtp("sms", normalizedMobile, otp);
    },

    async sendEmailOTP(email) {
      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail) throw new Error("Email is required.");
      return OtpService.dispatchEmailOtp(normalizedEmail);
    },

    async changePassword(payload = {}) {
      const cached = getSessionUser();
      const users = getMockUsers();
      const userId = cached?.user?.id;
      if (!userId) throw new Error("User session not found.");

      const index = users.findIndex((user) => user.id === userId);
      if (index === -1) throw new Error("User not found.");

      const currentPassword = String(payload.currentPassword || "");
      const nextPassword = String(payload.newPassword || "");
      if (!currentPassword || users[index].password !== currentPassword) {
        throw new Error("Current password is incorrect.");
      }

      users[index].password = assertStrongPassword(nextPassword);
      saveMockUsers(users);

      await safeAudit({
        action: "password_change",
        userId,
        email: users[index].email,
        source: "web",
      });

      return { success: true, message: "Password changed successfully." };
    },

    async getSession() {
      const cached = clearExpiredCachedSession();
      return cached?.session || null;
    },

    async forgotUserId(payload = {}) {
      const normalized = sanitizeRecoveryPayload({ ...payload, requestType: "FORGOT_USER_ID" });
      const users = getMockUsers();
      const matched = users.find((user) => {
        const emailMatch = normalized.email && normalizeEmail(user.email) === normalized.email;
        const mobileMatch = normalized.mobile && normalizeIndianMobile(user.mobile) === normalized.mobile;
        return emailMatch || mobileMatch;
      });

      const otpRecipient =
        normalized.preferredChannel === "email"
          ? normalized.email || normalizeEmail(matched?.email || "")
          : normalized.mobile || normalizeIndianMobile(matched?.mobile || "");
      const otpDispatch = await resolveOtpDispatch(normalized.preferredChannel, otpRecipient);
      const requestNo = generateRecoveryRequestNo();
      const tokenLifecycle = await issueRecoveryTokenLifecycle({
        requestNo,
        requestType: "FORGOT_USER_ID",
        userId: matched?.id || null,
        email: normalized.email || normalizeEmail(matched?.email || "") || null,
        mobile: normalized.mobile || normalizeIndianMobile(matched?.mobile || "") || null,
        preferredChannel: normalized.preferredChannel,
      });

      const request = {
        id: `recovery-${Date.now()}`,
        request_no: requestNo,
        request_type: "FORGOT_USER_ID",
        user_id: matched?.id || null,
        email: normalized.email || normalizeEmail(matched?.email || "") || null,
        mobile: normalized.mobile || normalizeIndianMobile(matched?.mobile || "") || null,
        preferred_channel: normalized.preferredChannel,
        status: "REQUESTED",
        reason: normalized.reason,
        metadata: normalized.metadata,
        otp_channel: normalized.preferredChannel,
        otp_reference: tokenLifecycle.token_reference,
        otp_status: otpDispatch.status,
        otp_provider: "placeholder",
        requested_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const requests = getRecoveryRequests();
      saveRecoveryRequests([request, ...requests]);
      persistRecoveryTokenFallback(tokenLifecycle);

      await safeAudit({
        action: "forgot_user_id_request",
        userId: matched?.id || null,
        email: normalized.email || matched?.email || null,
        source: "web",
        metadata: {
          request_no: request.request_no,
          request_type: request.request_type,
          preferred_channel: normalized.preferredChannel,
          otp_status: otpDispatch.providerStatus,
          token_reference: tokenLifecycle.token_reference,
          token_expires_at: tokenLifecycle.expires_at,
        },
      });

      return {
        success: true,
        requestNo: request.request_no,
        message: "If an account exists, recovery instructions will be processed.",
        otp: {
          channel: normalized.preferredChannel,
          status: otpDispatch.providerStatus,
          providerImplemented: false,
        },
        maskedUserId: matched?.user_id ? maskUserId(matched.user_id) : "",
      };
    },

    async forgotPassword(payload = {}) {
      const normalized = sanitizeRecoveryPayload({ ...payload, requestType: "FORGOT_PASSWORD" });
      const users = getMockUsers();
      const matched = users.find((user) => {
        const emailMatch = normalized.email && normalizeEmail(user.email) === normalized.email;
        const mobileMatch = normalized.mobile && normalizeIndianMobile(user.mobile) === normalized.mobile;
        return emailMatch || mobileMatch;
      });

      const otpRecipient =
        normalized.preferredChannel === "email"
          ? normalized.email || normalizeEmail(matched?.email || "")
          : normalized.mobile || normalizeIndianMobile(matched?.mobile || "");
      const otpDispatch = await resolveOtpDispatch(normalized.preferredChannel, otpRecipient);
      const requestNo = generateRecoveryRequestNo();
      const tokenLifecycle = await issueRecoveryTokenLifecycle({
        requestNo,
        requestType: "FORGOT_PASSWORD",
        userId: matched?.id || null,
        email: normalized.email || normalizeEmail(matched?.email || "") || null,
        mobile: normalized.mobile || normalizeIndianMobile(matched?.mobile || "") || null,
        preferredChannel: normalized.preferredChannel,
      });

      const request = {
        id: `recovery-${Date.now()}`,
        request_no: requestNo,
        request_type: "FORGOT_PASSWORD",
        user_id: matched?.id || null,
        email: normalized.email || normalizeEmail(matched?.email || "") || null,
        mobile: normalized.mobile || normalizeIndianMobile(matched?.mobile || "") || null,
        preferred_channel: normalized.preferredChannel,
        status: "REQUESTED",
        reason: normalized.reason,
        metadata: normalized.metadata,
        otp_channel: normalized.preferredChannel,
        otp_reference: tokenLifecycle.token_reference,
        otp_status: otpDispatch.status,
        otp_provider: "placeholder",
        requested_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const requests = getRecoveryRequests();
      saveRecoveryRequests([request, ...requests]);
      persistRecoveryTokenFallback(tokenLifecycle);

      await safeAudit({
        action: "forgot_password_request",
        userId: matched?.id || null,
        email: normalized.email || matched?.email || null,
        source: "web",
        metadata: {
          request_no: request.request_no,
          request_type: request.request_type,
          preferred_channel: normalized.preferredChannel,
          otp_status: otpDispatch.providerStatus,
          token_reference: tokenLifecycle.token_reference,
          token_expires_at: tokenLifecycle.expires_at,
        },
      });

      return {
        success: true,
        requestNo: request.request_no,
        message: "If an account exists, password reset workflow has been initiated.",
        otp: {
          channel: normalized.preferredChannel,
          status: otpDispatch.providerStatus,
          providerImplemented: false,
        },
      };
    },

    async requestAccountRecovery(payload = {}) {
      const normalized = sanitizeRecoveryPayload({ ...payload, requestType: "ACCOUNT_RECOVERY" });
      const users = getMockUsers();
      const matched = users.find((user) => {
        const emailMatch = normalized.email && normalizeEmail(user.email) === normalized.email;
        const mobileMatch = normalized.mobile && normalizeIndianMobile(user.mobile) === normalized.mobile;
        return emailMatch || mobileMatch;
      });

      const otpRecipient =
        normalized.preferredChannel === "email"
          ? normalized.email || normalizeEmail(matched?.email || "")
          : normalized.mobile || normalizeIndianMobile(matched?.mobile || "");
      const otpDispatch = await resolveOtpDispatch(normalized.preferredChannel, otpRecipient);
      const requestNo = generateRecoveryRequestNo();
      const tokenLifecycle = await issueRecoveryTokenLifecycle({
        requestNo,
        requestType: "ACCOUNT_RECOVERY",
        userId: matched?.id || null,
        email: normalized.email || normalizeEmail(matched?.email || "") || null,
        mobile: normalized.mobile || normalizeIndianMobile(matched?.mobile || "") || null,
        preferredChannel: normalized.preferredChannel,
      });

      const request = {
        id: `recovery-${Date.now()}`,
        request_no: requestNo,
        request_type: "ACCOUNT_RECOVERY",
        user_id: matched?.id || null,
        email: normalized.email || normalizeEmail(matched?.email || "") || null,
        mobile: normalized.mobile || normalizeIndianMobile(matched?.mobile || "") || null,
        preferred_channel: normalized.preferredChannel,
        status: "REQUESTED",
        reason: normalized.reason,
        metadata: normalized.metadata,
        otp_channel: normalized.preferredChannel,
        otp_reference: tokenLifecycle.token_reference,
        otp_status: otpDispatch.status,
        otp_provider: "placeholder",
        requested_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const requests = getRecoveryRequests();
      saveRecoveryRequests([request, ...requests]);
      persistRecoveryTokenFallback(tokenLifecycle);

      await safeAudit({
        action: "account_recovery_request",
        userId: matched?.id || null,
        email: normalized.email || matched?.email || null,
        source: "web",
        metadata: {
          request_no: request.request_no,
          request_type: request.request_type,
          preferred_channel: normalized.preferredChannel,
          otp_status: otpDispatch.providerStatus,
          token_reference: tokenLifecycle.token_reference,
          token_expires_at: tokenLifecycle.expires_at,
        },
      });

      return {
        success: true,
        requestNo: request.request_no,
        message: "Account recovery request submitted for admin review.",
        otp: {
          channel: normalized.preferredChannel,
          status: otpDispatch.providerStatus,
          providerImplemented: false,
        },
      };
    },

    async getRecoveryRequests(filters = {}) {
      const requests = getRecoveryRequests();
      const status = String(filters?.status || "ALL").toUpperCase();
      if (status === "ALL") return requests;
      return requests.filter((request) => String(request.status || "").toUpperCase() === status);
    },

    async reviewRecoveryRequest(requestNo, decision = "REJECTED", adminNotes = "") {
      const requests = getRecoveryRequests();
      const index = requests.findIndex((item) => item.request_no === requestNo);
      if (index === -1) {
        throw new Error("Recovery request not found.");
      }

      const normalizedDecision = String(decision || "REJECTED").toUpperCase();
      const allowedDecision = ["IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED"].includes(normalizedDecision)
        ? normalizedDecision
        : "REJECTED";
      requests[index] = {
        ...requests[index],
        status: allowedDecision,
        admin_notes: String(adminNotes || "").trim(),
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveRecoveryRequests(requests);

      await safeAudit({
        action: allowedDecision === "APPROVED" ? "recovery_approved" : "recovery_review",
        userId: requests[index].user_id || null,
        email: requests[index].email || null,
        source: "admin",
        metadata: {
          request_no: requestNo,
          request_type: requests[index].request_type,
          decision: allowedDecision,
        },
      });

      return requests[index];
    },

    onAuthStateChange(callback) {
      const cached = clearExpiredCachedSession();
      callback("INITIAL_SESSION", cached?.session || null);
      return () => { };
    },
  };
};

const supabaseAuth = {
  async register(userData = {}) {
    const normalizedPayload = ensureRegistrationPayload(userData);
    const normalizedRole = {
      legacyRole: "Member",
      roleCode: "member",
      roleCategory: "community",
    };
    const mobile = normalizedPayload.mobile;
    const email = normalizedPayload.email;

    const { data: existingEmailRows } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .limit(1);

    if (Array.isArray(existingEmailRows) && existingEmailRows.length > 0) {
      throw new Error("Email address is already registered.");
    }

    const { data: existingMobileRows } = await supabase
      .from("profiles")
      .select("id")
      .eq("mobile", mobile)
      .limit(1);

    if (Array.isArray(existingMobileRows) && existingMobileRows.length > 0) {
      throw new Error("Mobile number is already registered.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: normalizedPayload.password,
      options: {
        data: {
          full_name: normalizedPayload.fullName,
          mobile,
          whatsapp: normalizedPayload.whatsapp || null,
          profession: normalizedPayload.profession || null,
          organisation: normalizedPayload.organisation || null,
          designation: normalizedPayload.designation || null,
          remarks: normalizedPayload.remarks || null,
          age: normalizedPayload.age ?? null,
          dob: normalizedPayload.dateOfBirth || null,
          mobile_verified: false,
          email_verified: false,
          is_mobile_verified: false,
          is_email_verified: false,
          profile_photo: normalizedPayload.profilePhoto || null,
          signature: normalizedPayload.signature || null,
          registration_document: normalizedPayload.registrationDocument || null,
          registration_document_name: normalizedPayload.registrationDocumentName || null,
          registration_document_type: normalizedPayload.registrationDocumentType || null,
          registration_document_size: normalizedPayload.registrationDocumentSize || 0,
          date_of_birth: normalizedPayload.dateOfBirth || null,
          gender: normalizedPayload.gender || null,
          address: normalizedPayload.address || null,
          city: normalizedPayload.city || null,
          state: normalizedPayload.state || null,
          district: normalizedPayload.district || null,
          post_office: normalizedPayload.postOffice || null,
          country: normalizedPayload.country || "India",
          pin_code: normalizedPayload.pinCode || null,
          referral_code: normalizedPayload.referralCode || null,
          referred_by: normalizedPayload.referredBy || null,
          registration_type: normalizedPayload.registrationType || "individual",
          need_services: normalizedPayload.needServices || "receive",
          provide_services: normalizedPayload.provideServices || "no",
          service_category: normalizedPayload.serviceCategory || null,
          availability: normalizedPayload.availability || null,
          purpose: normalizedPayload.needServices || "receive",
          member_type: normalizedPayload.registrationType === "institutional"
            ? "Institutional"
            : "Individual",

          role: "Member",
          role_code: "member",
          role_category: "community",
          status: "Pending",
        },
      },
    });

    if (error) {
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("password")) {
        throw new Error(getPasswordPolicyMessage());
      }
      throw error;
    }

    let profile = null;
    if (data?.user?.id) {
      // Persist role and verification fields with backward-compatible fallback.
      const primaryUpdate = await supabase
        .from("profiles")
        .update({
          mobile,
          mobile_verified: false,
          email_verified: false,
          is_mobile_verified: false,
          is_email_verified: false,
          role_code: normalizedRole.roleCode,
          role_category: normalizedRole.roleCategory,
          legacy_role: normalizedRole.legacyRole,
          status: "Pending",
        })
        .eq("id", data.user.id);

      if (primaryUpdate.error) {
        await supabase
          .from("profiles")
          .update({
            mobile,
            is_mobile_verified: false,
            is_email_verified: false,
            role_code: normalizedRole.roleCode,
            role_category: normalizedRole.roleCategory,
            legacy_role: normalizedRole.legacyRole,
            status: "Pending",
          })
          .eq("id", data.user.id);
      }

      profile = await this.getProfile(data.user.id);
    }

    const enrichedProfile = enrichProfileRole(profile, data?.user);
    const accountStatus = String(enrichedProfile?.verification_status || enrichedProfile?.status || "").trim().toUpperCase();
    if (BLOCKED_ACCOUNT_STATUSES.has(accountStatus)) {
      throw new Error("This account is suspended or rejected. Please contact the System Admin.");
    }
    const result = {
      user: enrichUserRole(data?.user, enrichedProfile),
      profile: enrichedProfile,
      session: data?.session,
    };
    if (result.user) {
      setSessionUser(result);
      await safeAudit({
        action: "registration",
        userId: result.user.id,
        email,
        source: "web",
        metadata: { role_code: normalizedRole.roleCode },
      });
    }

    return result;
  },

  async login(credentials = {}) {
    const loginIdentity = resolveLoginIdentity(credentials);
    const selectedRole = normalizeLoginRoleCode(credentials);
    const password = String(credentials.password || "");

    if (!loginIdentity.identifier || !password) {
      throw new Error("Login ID and password are required.");
    }

    let email = loginIdentity.email;
    if (!email) {
      let profile = null;
      if (loginIdentity.mobile) {
        const { data } = await supabase
          .from("profiles")
          .select("id,email")
          .eq("mobile", loginIdentity.mobile)
          .limit(1);
        profile = Array.isArray(data) ? data[0] : null;
      } else if (loginIdentity.memberId) {
        const memberId = loginIdentity.memberId;
        const byMemberId = await supabase
          .from("profiles")
          .select("id,email")
          .eq("member_id", memberId)
          .limit(1);
        profile = Array.isArray(byMemberId?.data) ? byMemberId.data[0] : null;

        if (!profile) {
          const byUserId = await supabase
            .from("profiles")
            .select("id,email")
            .eq("user_id", memberId)
            .limit(1);
          profile = Array.isArray(byUserId?.data) ? byUserId.data[0] : null;
        }
      }

      email = normalizeEmail(profile?.email || "");
    }

    if (!email) {
      throw new Error("Invalid credentials.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await safeAudit({
        action: "login",
        email,
        status: "failed",
        source: "web",
        metadata: { reason: "invalid_credentials" },
      });
      throw error;
    }

    let profile = null;
    if (data?.user?.id) {
      profile = await this.getProfile(data.user.id);
    }

    const enrichedProfile = enrichProfileRole(profile, data?.user);
    const result = {
      user: enrichUserRole(data?.user, enrichedProfile),
      profile: enrichedProfile,
      session: data?.session,
    };

    const effectiveRole = resolveRoleCode(enrichedProfile, data?.user);
    if (selectedRole && selectedRole !== effectiveRole) {
      throw new Error("Selected role does not match this account.");
    }

    if (result.user) {
      setSessionUser(result);
      await safeAudit({
        action: "login",
        userId: result.user.id,
        email: result.user.email,
        source: "web",
      });
    }

    return result;
  },

  async logout() {
    const cached = getSessionUser();
    await supabase.auth.signOut();
    clearKey(SESSION_KEY);
    await safeAudit({
      action: "logout",
      userId: cached?.user?.id,
      email: cached?.user?.email,
      source: "web",
    });
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const cached = getSessionUser();
      return cached?.user || null;
    }

    const profile = await this.getProfile(user.id);
    const enrichedProfile = enrichProfileRole(profile, user);
    const current = enrichUserRole(user, enrichedProfile);
    setSessionUser({ user: current, profile: enrichedProfile, session: null });
    return current;
  },

  async isLoggedIn() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Boolean(user) || Boolean(getSessionUser()?.user);
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) return null;
    return enrichProfileRole(data, data);
  },

  async updateProfile(userId, updates = {}) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    const enriched = enrichProfileRole(data, data);
    const cached = getSessionUser();
    if (cached?.user?.id === userId) {
      setSessionUser({ ...cached, profile: enriched, user: { ...cached.user, profile: enriched } });
    }

    await safeAudit({
      action: "profile_update",
      userId,
      email: enriched?.email,
      source: "web",
    });

    return enriched;
  },

  async sendMobileOTP(mobile, options = {}) {
    const normalizedMobile = assertIndianMobile(mobile);
    const channel = options.channel === "whatsapp" ? "whatsapp" : "sms";
    if (channel === "whatsapp") {
      return OtpService.dispatchWhatsAppOtp(normalizedMobile);
    }
    return OtpService.dispatchSmsOtp(normalizedMobile);
  },

  async sendWhatsAppOTP(mobile) {
    const normalizedMobile = assertIndianMobile(mobile);
    return OtpService.dispatchWhatsAppOtp(normalizedMobile);
  },

  async verifyMobileOTP(mobile, otp) {
    const normalizedMobile = assertIndianMobile(mobile);
    if (!String(otp || "").trim()) {
      throw new Error("OTP is required.");
    }
    return OtpService.verifyOtp("sms", normalizedMobile, otp);
  },

  async sendEmailOTP(email) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error("Email is required.");
    return OtpService.dispatchEmailOtp(normalizedEmail);
  },

  async changePassword(payload = {}) {
    const nextPassword = assertStrongPassword(payload.newPassword || "");
    const { error } = await supabase.auth.updateUser({ password: nextPassword });
    if (error) throw error;

    const cached = getSessionUser();
    await safeAudit({
      action: "password_change",
      userId: cached?.user?.id,
      email: cached?.user?.email,
      source: "web",
    });

    return { success: true, message: "Password changed successfully." };
  },

  async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const cached = getSessionUser();
      return cached?.session || null;
    }

    return session;
  },

  async forgotUserId(payload = {}) {
    const normalized = sanitizeRecoveryPayload({ ...payload, requestType: "FORGOT_USER_ID" });

    const query = supabase.from("profiles").select("id,user_id,email,mobile").limit(1);
    const response = normalized.email
      ? await query.ilike("email", normalized.email)
      : await query.eq("mobile", normalized.mobile);
    const profile = Array.isArray(response?.data) ? response.data[0] : null;

    const otpRecipient =
      normalized.preferredChannel === "email"
        ? normalized.email || normalizeEmail(profile?.email || "")
        : normalized.mobile || normalizeIndianMobile(profile?.mobile || "");
    const otpDispatch = await resolveOtpDispatch(normalized.preferredChannel, otpRecipient);
    const requestNo = generateRecoveryRequestNo();
    const tokenLifecycle = await issueRecoveryTokenLifecycle({
      requestNo,
      requestType: "FORGOT_USER_ID",
      userId: profile?.id || null,
      email: normalized.email || normalizeEmail(profile?.email || "") || null,
      mobile: normalized.mobile || normalizeIndianMobile(profile?.mobile || "") || null,
      preferredChannel: normalized.preferredChannel,
    });

    const requestRow = {
      request_no: requestNo,
      request_type: "FORGOT_USER_ID",
      user_id: profile?.id || null,
      email: normalized.email || normalizeEmail(profile?.email || "") || null,
      mobile: normalized.mobile || normalizeIndianMobile(profile?.mobile || "") || null,
      preferred_channel: normalized.preferredChannel,
      status: "REQUESTED",
      reason: normalized.reason,
      metadata: normalized.metadata,
      otp_channel: normalized.preferredChannel,
      otp_reference: tokenLifecycle.token_reference,
      otp_status: otpDispatch.status,
      otp_provider: "placeholder",
    };

    try {
      await supabase.from("auth_recovery_requests").insert([requestRow]);
      await supabase.from("auth_recovery_tokens").insert([tokenLifecycle]);
    } catch {
      const fallback = getRecoveryRequests();
      saveRecoveryRequests([
        {
          id: `recovery-${Date.now()}`,
          ...requestRow,
          requested_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...fallback,
      ]);
      persistRecoveryTokenFallback(tokenLifecycle);
    }

    await safeAudit({
      action: "forgot_user_id_request",
      userId: profile?.id || null,
      email: normalized.email || profile?.email || null,
      source: "web",
      metadata: {
        request_no: requestRow.request_no,
        request_type: requestRow.request_type,
        preferred_channel: normalized.preferredChannel,
        otp_status: otpDispatch.providerStatus,
        token_reference: tokenLifecycle.token_reference,
        token_expires_at: tokenLifecycle.expires_at,
      },
    });

    return {
      success: true,
      requestNo: requestRow.request_no,
      message: "If an account exists, recovery instructions will be processed.",
      otp: {
        channel: normalized.preferredChannel,
        status: otpDispatch.providerStatus,
        providerImplemented: false,
      },
      maskedUserId: profile?.user_id ? maskUserId(profile.user_id) : "",
      maskedEmail: profile?.email ? maskEmail(profile.email) : "",
    };
  },

  async forgotPassword(payload = {}) {
    const normalized = sanitizeRecoveryPayload({ ...payload, requestType: "FORGOT_PASSWORD" });

    const query = supabase.from("profiles").select("id,user_id,email,mobile").limit(1);
    const response = normalized.email
      ? await query.ilike("email", normalized.email)
      : await query.eq("mobile", normalized.mobile);
    const profile = Array.isArray(response?.data) ? response.data[0] : null;

    const otpRecipient =
      normalized.preferredChannel === "email"
        ? normalized.email || normalizeEmail(profile?.email || "")
        : normalized.mobile || normalizeIndianMobile(profile?.mobile || "");
    const otpDispatch = await resolveOtpDispatch(normalized.preferredChannel, otpRecipient);
    const requestNo = generateRecoveryRequestNo();
    const tokenLifecycle = await issueRecoveryTokenLifecycle({
      requestNo,
      requestType: "FORGOT_PASSWORD",
      userId: profile?.id || null,
      email: normalized.email || normalizeEmail(profile?.email || "") || null,
      mobile: normalized.mobile || normalizeIndianMobile(profile?.mobile || "") || null,
      preferredChannel: normalized.preferredChannel,
    });

    const requestRow = {
      request_no: requestNo,
      request_type: "FORGOT_PASSWORD",
      user_id: profile?.id || null,
      email: normalized.email || normalizeEmail(profile?.email || "") || null,
      mobile: normalized.mobile || normalizeIndianMobile(profile?.mobile || "") || null,
      preferred_channel: normalized.preferredChannel,
      status: "REQUESTED",
      reason: normalized.reason,
      metadata: normalized.metadata,
      otp_channel: normalized.preferredChannel,
      otp_reference: tokenLifecycle.token_reference,
      otp_status: otpDispatch.status,
      otp_provider: "placeholder",
    };

    try {
      await supabase.from("auth_recovery_requests").insert([requestRow]);
      await supabase.from("auth_recovery_tokens").insert([tokenLifecycle]);
    } catch {
      const fallback = getRecoveryRequests();
      saveRecoveryRequests([
        {
          id: `recovery-${Date.now()}`,
          ...requestRow,
          requested_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...fallback,
      ]);
      persistRecoveryTokenFallback(tokenLifecycle);
    }

    await safeAudit({
      action: "forgot_password_request",
      userId: profile?.id || null,
      email: normalized.email || profile?.email || null,
      source: "web",
      metadata: {
        request_no: requestRow.request_no,
        request_type: requestRow.request_type,
        preferred_channel: normalized.preferredChannel,
        otp_status: otpDispatch.providerStatus,
        token_reference: tokenLifecycle.token_reference,
        token_expires_at: tokenLifecycle.expires_at,
      },
    });

    return {
      success: true,
      requestNo: requestRow.request_no,
      message: "If an account exists, password reset workflow has been initiated.",
      otp: {
        channel: normalized.preferredChannel,
        status: otpDispatch.providerStatus,
        providerImplemented: false,
      },
    };
  },

  async requestAccountRecovery(payload = {}) {
    const normalized = sanitizeRecoveryPayload({ ...payload, requestType: "ACCOUNT_RECOVERY" });

    const query = supabase.from("profiles").select("id,user_id,email,mobile").limit(1);
    const response = normalized.email
      ? await query.ilike("email", normalized.email)
      : await query.eq("mobile", normalized.mobile);
    const profile = Array.isArray(response?.data) ? response.data[0] : null;

    const otpRecipient =
      normalized.preferredChannel === "email"
        ? normalized.email || normalizeEmail(profile?.email || "")
        : normalized.mobile || normalizeIndianMobile(profile?.mobile || "");
    const otpDispatch = await resolveOtpDispatch(normalized.preferredChannel, otpRecipient);
    const requestNo = generateRecoveryRequestNo();
    const tokenLifecycle = await issueRecoveryTokenLifecycle({
      requestNo,
      requestType: "ACCOUNT_RECOVERY",
      userId: profile?.id || null,
      email: normalized.email || normalizeEmail(profile?.email || "") || null,
      mobile: normalized.mobile || normalizeIndianMobile(profile?.mobile || "") || null,
      preferredChannel: normalized.preferredChannel,
    });

    const requestRow = {
      request_no: requestNo,
      request_type: "ACCOUNT_RECOVERY",
      user_id: profile?.id || null,
      email: normalized.email || normalizeEmail(profile?.email || "") || null,
      mobile: normalized.mobile || normalizeIndianMobile(profile?.mobile || "") || null,
      preferred_channel: normalized.preferredChannel,
      status: "REQUESTED",
      reason: normalized.reason,
      metadata: normalized.metadata,
      otp_channel: normalized.preferredChannel,
      otp_reference: tokenLifecycle.token_reference,
      otp_status: otpDispatch.status,
      otp_provider: "placeholder",
    };

    try {
      await supabase.from("auth_recovery_requests").insert([requestRow]);
      await supabase.from("auth_recovery_tokens").insert([tokenLifecycle]);
    } catch {
      const fallback = getRecoveryRequests();
      saveRecoveryRequests([
        {
          id: `recovery-${Date.now()}`,
          ...requestRow,
          requested_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...fallback,
      ]);
      persistRecoveryTokenFallback(tokenLifecycle);
    }

    await safeAudit({
      action: "account_recovery_request",
      userId: profile?.id || null,
      email: normalized.email || profile?.email || null,
      source: "web",
      metadata: {
        request_no: requestRow.request_no,
        request_type: requestRow.request_type,
        preferred_channel: normalized.preferredChannel,
        otp_status: otpDispatch.providerStatus,
        token_reference: tokenLifecycle.token_reference,
        token_expires_at: tokenLifecycle.expires_at,
      },
    });

    return {
      success: true,
      requestNo: requestRow.request_no,
      message: "Account recovery request submitted for admin review.",
      otp: {
        channel: normalized.preferredChannel,
        status: otpDispatch.providerStatus,
        providerImplemented: false,
      },
    };
  },

  async getRecoveryRequests(filters = {}) {
    const status = String(filters?.status || "ALL").toUpperCase();
    try {
      let query = supabase
        .from("auth_recovery_requests")
        .select("*")
        .order("requested_at", { ascending: false });

      if (status !== "ALL") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    } catch {
      const fallback = getRecoveryRequests();
      if (status === "ALL") return fallback;
      return fallback.filter((item) => String(item.status || "").toUpperCase() === status);
    }
  },

  async reviewRecoveryRequest(requestNo, decision = "REJECTED", adminNotes = "") {
    const normalizedDecision = String(decision || "REJECTED").toUpperCase();
    const allowedDecision = ["IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED"].includes(normalizedDecision)
      ? normalizedDecision
      : "REJECTED";
    const updateValues = {
      status: allowedDecision,
      admin_notes: String(adminNotes || "").trim(),
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let row;
    try {
      const { data, error } = await supabase
        .from("auth_recovery_requests")
        .update(updateValues)
        .eq("request_no", requestNo)
        .select("*")
        .single();
      if (error) throw error;
      row = data;
    } catch {
      const fallback = getRecoveryRequests();
      const index = fallback.findIndex((item) => item.request_no === requestNo);
      if (index === -1) {
        throw new Error("Recovery request not found.");
      }
      fallback[index] = { ...fallback[index], ...updateValues };
      saveRecoveryRequests(fallback);
      row = fallback[index];
    }

    await safeAudit({
      action: allowedDecision === "APPROVED" ? "recovery_approved" : "recovery_review",
      userId: row?.user_id || null,
      email: row?.email || null,
      source: "admin",
      metadata: {
        request_no: requestNo,
        request_type: row?.request_type || "",
        decision: allowedDecision,
      },
    });

    return row;
  },

  onAuthStateChange(callback) {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  },
};

const mockAuth = createMockAuthProvider();

const withFallback = async (operation) => {
  if (!isSupabaseConfigured) {
    if (allowMockAuth) {
      return await operation(mockAuth);
    }
    throw new Error(
      "Supabase authentication is not configured. Set VITE_ENABLE_SUPABASE=true with valid Supabase env variables, or enable VITE_ENABLE_MOCK_AUTH=true only for local development."
    );
  }

  try {
    return await operation(supabaseAuth);
  } catch (error) {
    if (allowMockAuth && !strictAuthMode) {
      console.warn("[AuthService] Supabase auth failed, using mock auth fallback:", error?.message || error);
      return await operation(mockAuth);
    }
    throw error;
  }
};

const AuthService = {
  register: async (payload) => {
    await runRegistrationSecurityChecks(payload);
    const result = await withFallback((provider) => provider.register(payload));
    try {
      const roleCode = resolveRoleCode(result?.profile, result?.user);
      await PersonService.upsertPersonMembership(
        {
          id: result?.profile?.id || result?.user?.id || "",
          member_id: result?.profile?.member_id || result?.user?.id || "",
          full_name: result?.profile?.full_name || payload?.fullName || "",
          name: result?.profile?.full_name || payload?.fullName || "",
          email: result?.user?.email || payload?.email || "",
          mobile: result?.profile?.mobile || payload?.mobile || "",
          status: result?.profile?.status || "Pending",
          verification_status: result?.profile?.verification_status || "Pending",
          role: roleCode,
          role_code: roleCode,
        },
        { roleCode }
      );
    } catch {
      // Keep registration flow non-blocking when canonical person sync fallback fails.
    }
    await registerSessionInventory(result, { source: "registration" });
    return result;
  },
  login: async (payload) => {
    let control = null;
    try {
      control = await runLoginSecurityChecks(payload);
      const result = await withFallback((provider) => provider.login(payload));
      await onLoginSuccessSecurity(result, payload, control);
      await registerSessionInventory(result, { source: "login" });
      return result;
    } catch (error) {
      await onLoginFailedSecurity(payload, error, control);
      throw error;
    }
  },
  logout: async () => {
    if (ENABLE_SESSION_INVENTORY) {
      const currentReference = getCurrentSessionReference();
      if (currentReference) {
        await updateSessionStatus({
          sessionReference: currentReference,
          status: SESSION_STATUS_LOGGED_OUT,
          markLogout: true,
        });
        await safeAudit({
          action: "session_logout",
          userId: resolveActorFromSession().userId,
          email: resolveActorFromSession().email,
          source: "web",
          metadata: { session_reference: currentReference },
        });
      }
      clearKey(CURRENT_SESSION_REFERENCE_KEY);
    }
    clearKey(CURRENT_DEVICE_REFERENCE_KEY);
    clearKey(ACTIVE_ORGANIZATION_KEY);
    return withFallback((provider) => provider.logout());
  },
  getCurrentUser: async () => {
    const user = await withFallback((provider) => provider.getCurrentUser());
    const active = await ensureCurrentSessionIsActive();
    if (!active) return null;
    const trusted = await ensureCurrentDeviceIsTrusted();
    if (!trusted) return null;
    const currentReference = getCurrentSessionReference();
    if (currentReference) {
      await touchSessionActivity(currentReference);
    }
    return user;
  },
  isLoggedIn: async () => {
    const loggedIn = await withFallback((provider) => provider.isLoggedIn());
    if (!loggedIn) return false;
    const active = await ensureCurrentSessionIsActive();
    if (!active) return false;
    const trusted = await ensureCurrentDeviceIsTrusted();
    return Boolean(trusted);
  },
  getProfile: (userId) => withFallback((provider) => provider.getProfile(userId)),
  updateProfile: (userId, updates) => withFallback((provider) => provider.updateProfile(userId, updates)),
  sendMobileOTP: (mobile, options) => withFallback((provider) => provider.sendMobileOTP(mobile, options)),
  sendWhatsAppOTP: (mobile) => withFallback((provider) => provider.sendWhatsAppOTP(mobile)),
  verifyMobileOTP: (mobile, otp) => withFallback((provider) => provider.verifyMobileOTP(mobile, otp)),
  sendEmailOTP: (email) => withFallback((provider) => provider.sendEmailOTP(email)),
  changePassword: (payload) => withFallback((provider) => provider.changePassword(payload)),
  forgotUserId: (payload) => withFallback((provider) => provider.forgotUserId(payload)),
  forgotPassword: (payload) => withFallback((provider) => provider.forgotPassword(payload)),
  requestAccountRecovery: (payload) => withFallback((provider) => provider.requestAccountRecovery(payload)),
  getRecoveryRequests: (filters) => withFallback((provider) => provider.getRecoveryRequests(filters)),
  reviewRecoveryRequest: (requestNo, decision, adminNotes) =>
    withFallback((provider) => provider.reviewRecoveryRequest(requestNo, decision, adminNotes)),
  getLockedAccounts: async () => listLockedControls(),
  unlockLockedAccount: async (identity = {}, adminNotes = "") => {
    const unlocked = await unlockSecurityControl(identity, adminNotes);
    await safeAudit({
      action: "security_account_unlocked",
      userId: unlocked?.user_id || null,
      email: unlocked?.email || normalizeEmail(identity?.email || "") || null,
      source: "admin",
      status: "success",
      metadata: {
        identity_key: unlocked?.identity_key || toSecurityIdentityKey(identity),
        notes: String(adminNotes || "").trim(),
      },
    });
    return unlocked;
  },
  getSession: async () => {
    const session = await withFallback((provider) => provider.getSession());
    if (!ENABLE_SESSION_INVENTORY || !session?.user?.id) return session;

    const resolvedReference = await buildSessionReferenceFromSession(session, session.user.id);
    setCurrentSessionReference(resolvedReference);
    await registerSessionInventory(
      {
        user: session.user,
        profile: null,
        session,
      },
      {
        source: "session_restore",
        sessionReference: resolvedReference,
      }
    );
    await touchSessionActivity(resolvedReference);
    return session;
  },
  getMySessions: async (filters = {}) => {
    const actor = assertSessionPermission("session.view.own");
    const rows = await listSessionRecords({ userId: actor.userId, activeOnly: false });
    const activeOnly = Boolean(filters?.activeOnly);
    return activeOnly ? rows.filter((row) => row.status === SESSION_STATUS_ACTIVE) : rows;
  },
  getActiveSessionsForAdmin: async () => {
    assertSessionPermission("session.view.all");
    return listSessionRecords({ activeOnly: true });
  },
  revokeSessionAsAdmin: async (sessionReference, reason = "") => {
    const actor = assertSessionPermission("session.revoke.any");
    if (!ENABLE_SESSION_GLOBAL_REVOKE) {
      throw new Error("Global session revoke is disabled.");
    }

    const updated = await updateSessionStatus({
      sessionReference,
      status: SESSION_STATUS_REVOKED,
      revokedBy: actor.userId,
      revokeReason: String(reason || "").trim() || "Revoked by administrator",
    });
    if (!updated) {
      throw new Error("Session not found.");
    }

    await safeAudit({
      action: "session_revoked_admin",
      userId: updated.user_id,
      email: updated.email,
      source: "admin",
      status: "revoked",
      metadata: {
        session_reference: updated.session_reference,
        revoked_by: actor.userId,
        reason: updated.revoke_reason,
      },
    });
    return updated;
  },
  revokeOwnSession: async (sessionReference, reason = "") => {
    const actor = assertSessionPermission("session.revoke.own");
    const row = await getSessionRecordByReference(sessionReference);
    if (!row || row.user_id !== actor.userId) {
      throw new Error("Session not found.");
    }

    const updated = await updateSessionStatus({
      sessionReference,
      status: SESSION_STATUS_REVOKED,
      revokedBy: actor.userId,
      revokeReason: String(reason || "").trim() || "Revoked by user",
    });

    await safeAudit({
      action: "session_revoked_self",
      userId: actor.userId,
      email: actor.email,
      source: "web",
      status: "revoked",
      metadata: {
        session_reference: sessionReference,
        reason: updated?.revoke_reason || "",
      },
    });

    const currentReference = getCurrentSessionReference();
    if (currentReference && currentReference === sessionReference) {
      await withFallback((provider) => provider.logout());
      clearKey(CURRENT_SESSION_REFERENCE_KEY);
      clearKey(CURRENT_DEVICE_REFERENCE_KEY);
    }

    return updated;
  },
  revokeOtherSessions: async (reason = "") => {
    const actor = assertSessionPermission("session.revoke.others");
    if (!ENABLE_SESSION_GLOBAL_REVOKE) {
      throw new Error("Global session revoke is disabled.");
    }

    const currentReference = getCurrentSessionReference();
    const mySessions = await listSessionRecords({ userId: actor.userId, activeOnly: true });
    const targets = mySessions.filter((row) => row.session_reference !== currentReference);

    for (const row of targets) {
      await updateSessionStatus({
        sessionReference: row.session_reference,
        status: SESSION_STATUS_REVOKED,
        revokedBy: actor.userId,
        revokeReason: String(reason || "").trim() || "Logged out from other devices",
      });
    }

    await safeAudit({
      action: "session_revoked_others",
      userId: actor.userId,
      email: actor.email,
      source: "web",
      status: "success",
      metadata: {
        affected_sessions: targets.map((row) => row.session_reference),
        affected_count: targets.length,
      },
    });

    return { success: true, affectedCount: targets.length };
  },
  getActiveOrganization: async () => {
    return getActiveOrganizationContext();
  },
  switchOrganization: async (organizationId) => {
    const current = readJson(SESSION_KEY, null);
    const memberId = current?.profile?.member_id || current?.profile?.id || current?.user?.id || "";
    if (!memberId) {
      throw new Error("No authenticated user available for organization switch.");
    }

    const switched = await OrganizationService.switchOrganization(memberId, organizationId);
    const context = {
      organization_id: switched.organization.id,
      organization: switched.organization,
      membership: switched.membership,
      switched_at: new Date().toISOString(),
    };
    setActiveOrganizationContext(context);
    return context;
  },
  getMyOrganizations: async () => {
    const current = readJson(SESSION_KEY, null);
    const memberId = current?.profile?.member_id || current?.profile?.id || current?.user?.id || "";
    if (!memberId) return [];

    const [memberships, organizations] = await Promise.all([
      OrganizationService.getMemberships({ memberId }),
      OrganizationService.getAll(),
    ]);

    return memberships
      .filter((row) => row.status === "ACTIVE")
      .map((row) => {
        const org = organizations.find((item) => String(item.id) === String(row.organization_id));
        return {
          membership: row,
          organization: org || null,
        };
      });
  },
  getMyTrustedDevices: async (filters = {}) => {
    const actor = assertDevicePermission("device.view.own");
    const includeRevoked = Boolean(filters?.includeRevoked ?? true);
    return listTrustedDevices({ userId: actor.userId, includeRevoked });
  },
  getTrustedDevicesForAdmin: async (filters = {}) => {
    assertDevicePermission("device.view.all");
    const includeRevoked = Boolean(filters?.includeRevoked ?? true);
    return listTrustedDevices({ includeRevoked });
  },
  revokeOwnTrustedDevice: async (deviceReference, reason = "") => {
    const actor = assertDevicePermission("device.revoke.own");
    const result = await revokeTrustedDevice({
      actorUserId: actor.userId,
      actorSource: "web",
      userId: actor.userId,
      deviceReference,
      reason: String(reason || "").trim() || "Trusted device revoked by user",
    });

    await safeAudit({
      action: "device_revoked_user",
      userId: actor.userId,
      email: actor.email,
      source: "web",
      status: "revoked",
      metadata: {
        device_reference: deviceReference,
        affected_sessions: result.affectedCount,
        reason: result.updated.revoke_reason,
      },
    });

    const currentDevice = getCurrentDeviceReference();
    if (currentDevice && currentDevice === deviceReference) {
      await withFallback((provider) => provider.logout());
      clearKey(CURRENT_SESSION_REFERENCE_KEY);
      clearKey(CURRENT_DEVICE_REFERENCE_KEY);
    }

    return result;
  },
  revokeTrustedDeviceAsAdmin: async (deviceReference, reason = "") => {
    const actor = assertDevicePermission("device.revoke.any");
    const device = await getTrustedDeviceByReference({ deviceReference });
    if (!device) throw new Error("Trusted device not found.");

    const result = await revokeTrustedDevice({
      actorUserId: actor.userId,
      actorSource: "admin",
      userId: device.user_id,
      deviceReference,
      reason: String(reason || "").trim() || "Trusted device revoked by administrator",
    });

    await safeAudit({
      action: "device_revoked_admin",
      userId: device.user_id,
      email: device.email,
      source: "admin",
      status: "revoked",
      metadata: {
        device_reference: deviceReference,
        revoked_by: actor.userId,
        affected_sessions: result.affectedCount,
        reason: result.updated.revoke_reason,
      },
    });

    return result;
  },
  onAuthStateChange: (callback) => {
    if (!isSupabaseConfigured) {
      if (allowMockAuth) {
        return mockAuth.onAuthStateChange(callback);
      }
      return () => { };
    }

    try {
      return supabaseAuth.onAuthStateChange(callback);
    } catch {
      if (!(allowMockAuth && !strictAuthMode)) {
        return () => { };
      }
      return mockAuth.onAuthStateChange(callback);
    }
  },
};

export default AuthService;
