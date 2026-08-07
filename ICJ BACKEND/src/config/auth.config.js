const parseBooleanFlag = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
};

const parseNumberFlag = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const ENABLE_SMS_OTP = parseBooleanFlag(import.meta.env.VITE_ENABLE_SMS_OTP, false);
export const ENABLE_WHATSAPP_OTP = parseBooleanFlag(import.meta.env.VITE_ENABLE_WHATSAPP_OTP, false);
export const ENABLE_EMAIL_OTP = parseBooleanFlag(import.meta.env.VITE_ENABLE_EMAIL_OTP, false);

export const ENABLE_EMAIL_NOTIFICATIONS = parseBooleanFlag(
  import.meta.env.VITE_ENABLE_EMAIL_NOTIFICATIONS,
  false
);
export const ENABLE_SMS_NOTIFICATIONS = parseBooleanFlag(
  import.meta.env.VITE_ENABLE_SMS_NOTIFICATIONS,
  false
);
export const ENABLE_WHATSAPP_NOTIFICATIONS = parseBooleanFlag(
  import.meta.env.VITE_ENABLE_WHATSAPP_NOTIFICATIONS,
  false
);
export const ENABLE_INAPP_NOTIFICATIONS = parseBooleanFlag(
  import.meta.env.VITE_ENABLE_INAPP_NOTIFICATIONS,
  false
);

export const ENABLE_REGISTRATION_RATE_LIMIT = parseBooleanFlag(
  import.meta.env.VITE_ENABLE_REGISTRATION_RATE_LIMIT,
  true
);
export const ENABLE_LOGIN_RATE_LIMIT = parseBooleanFlag(import.meta.env.VITE_ENABLE_LOGIN_RATE_LIMIT, true);
export const ENABLE_BRUTE_FORCE_PROTECTION = parseBooleanFlag(
  import.meta.env.VITE_ENABLE_BRUTE_FORCE_PROTECTION,
  true
);
export const ENABLE_ACCOUNT_LOCKOUT = parseBooleanFlag(import.meta.env.VITE_ENABLE_ACCOUNT_LOCKOUT, true);
export const ENABLE_ADAPTIVE_RISK_SCORING = parseBooleanFlag(
  import.meta.env.VITE_ENABLE_ADAPTIVE_RISK_SCORING,
  true
);
export const ENABLE_ADAPTIVE_RISK_BLOCK = parseBooleanFlag(
  import.meta.env.VITE_ENABLE_ADAPTIVE_RISK_BLOCK,
  false
);
export const ENABLE_SESSION_INVENTORY = parseBooleanFlag(import.meta.env.VITE_ENABLE_SESSION_INVENTORY, true);
export const ENABLE_SESSION_GLOBAL_REVOKE = parseBooleanFlag(
  import.meta.env.VITE_ENABLE_SESSION_GLOBAL_REVOKE,
  true
);
export const ENABLE_DEVICE_REGISTRY = parseBooleanFlag(import.meta.env.VITE_ENABLE_DEVICE_REGISTRY, true);
export const ENABLE_DEVICE_REMOTE_LOGOUT = parseBooleanFlag(
  import.meta.env.VITE_ENABLE_DEVICE_REMOTE_LOGOUT,
  true
);

export const AUTH_REGISTRATION_MAX_ATTEMPTS = parseNumberFlag(
  import.meta.env.VITE_AUTH_REGISTRATION_MAX_ATTEMPTS,
  5
);
export const AUTH_REGISTRATION_WINDOW_MINUTES = parseNumberFlag(
  import.meta.env.VITE_AUTH_REGISTRATION_WINDOW_MINUTES,
  15
);
export const AUTH_LOGIN_MAX_ATTEMPTS = parseNumberFlag(import.meta.env.VITE_AUTH_LOGIN_MAX_ATTEMPTS, 8);
export const AUTH_LOGIN_WINDOW_MINUTES = parseNumberFlag(import.meta.env.VITE_AUTH_LOGIN_WINDOW_MINUTES, 15);
export const AUTH_BRUTE_FORCE_MAX_FAILED_ATTEMPTS = parseNumberFlag(
  import.meta.env.VITE_AUTH_BRUTE_FORCE_MAX_FAILED_ATTEMPTS,
  5
);
export const AUTH_ACCOUNT_LOCK_FAILED_ATTEMPTS = parseNumberFlag(
  import.meta.env.VITE_AUTH_ACCOUNT_LOCK_FAILED_ATTEMPTS,
  5
);
export const AUTH_BRUTE_FORCE_WINDOW_MINUTES = parseNumberFlag(
  import.meta.env.VITE_AUTH_BRUTE_FORCE_WINDOW_MINUTES,
  15
);
export const AUTH_ACCOUNT_LOCK_DURATION_MINUTES = parseNumberFlag(
  import.meta.env.VITE_AUTH_ACCOUNT_LOCK_DURATION_MINUTES,
  30
);
export const AUTH_RISK_BLOCK_THRESHOLD = parseNumberFlag(import.meta.env.VITE_AUTH_RISK_BLOCK_THRESHOLD, 85);
export const AUTH_SESSION_IDLE_UPDATE_SECONDS = parseNumberFlag(
  import.meta.env.VITE_AUTH_SESSION_IDLE_UPDATE_SECONDS,
  60
);
export const AUTH_DEVICE_STALE_DAYS = parseNumberFlag(import.meta.env.VITE_AUTH_DEVICE_STALE_DAYS, 90);

export const USER_ACCOUNT_STATUSES = Object.freeze([
  "Pending",
  "Active",
  "Suspended",
  "Rejected",
]);

export const REGISTRATION_PASSWORD_POLICY = Object.freeze({
  minLength: 8,
  maxLength: 64,
  requiresUppercase: true,
  requiresLowercase: true,
  requiresDigit: true,
  requiresSpecialCharacter: true,
});
