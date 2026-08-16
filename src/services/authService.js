import { supabase } from "./supabase.js";
import PasswordPolicyService from "./passwordPolicyService.js";
import { ENTERPRISE_SEED_USERS } from "../data/seedUsers.js";
import SeedEcosystemService from "./seedEcosystemService.js";
import ProductionHardeningService from "./productionHardeningService.js";

const SESSION_KEY = "icj_user";
const USERS_STORAGE_KEY = "icj_enterprise_users";

const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};

const canUseSupabaseAuth =
  Boolean(env.VITE_SUPABASE_URL) &&
  Boolean(env.VITE_SUPABASE_PUBLISHABLE_KEY);

// A record can only be signed into if it carries a hash or a literal password.
const hasLoginCredential = (u) => Boolean(u?.passwordHash || u?.password);

// The 26-member registry and the 7 documented enterprise accounts are distinct
// sets (different emails). Both must be present or their credentials won't work.
const withEnterpriseAccounts = (members) => {
  const seen = new Set(
    members.map((u) => String(u.email || "").trim().toLowerCase()).filter(Boolean)
  );
  const missing = ENTERPRISE_SEED_USERS.filter(
    (u) => !seen.has(String(u.email || "").trim().toLowerCase())
  );
  return [...members, ...missing];
};

const getStoredUsers = () => {
  if (typeof window === "undefined") {
    return withEnterpriseAccounts(SeedEcosystemService.get26CoreMembers());
  }
  try {
    const rawEnterprise = window.localStorage.getItem(USERS_STORAGE_KEY);
    const initialized = window.localStorage.getItem("icj_users_initialized");

    if (initialized === "true") {
      let existingUsers = [];
      if (rawEnterprise) {
        try {
          existingUsers = JSON.parse(rawEnterprise);
        } catch {
          existingUsers = [];
        }
      }
      // Re-hydrate if the cached copy predates login credentials being added to
      // the seed registry — otherwise those accounts can never authenticate.
      const usable =
        Array.isArray(existingUsers) &&
        existingUsers.length >= 26 &&
        existingUsers.some(hasLoginCredential);

      if (usable) return withEnterpriseAccounts(existingUsers);
      return withEnterpriseAccounts(SeedEcosystemService.resetAndHydrate26CoreMembers());
    }
    // First time initialization: seed the database from 26 Core Master Members
    return withEnterpriseAccounts(SeedEcosystemService.resetAndHydrate26CoreMembers());
  } catch {
    return withEnterpriseAccounts(SeedEcosystemService.get26CoreMembers());
  }
};

const saveStoredUsers = (users) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  window.localStorage.setItem("icj_members", JSON.stringify(users));
};

// Earlier builds fabricated a Super Admin session — in getCurrentUser() and
// again in database.js's import-time self-heal. Those sessions were written to
// localStorage, so deleting the code does not remove them: any browser that
// already opened the app stays signed in as an administrator forever. Clear the
// session once per browser so everyone re-authenticates against the fixed code.
const SESSION_TRUST_KEY = "icj_session_trust_version";
const SESSION_TRUST_VERSION = "2026-08-16-auth-fix";

const purgeUntrustedSession = () => {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(SESSION_TRUST_KEY) !== SESSION_TRUST_VERSION) {
      window.localStorage.removeItem(SESSION_KEY);
      window.localStorage.setItem(SESSION_TRUST_KEY, SESSION_TRUST_VERSION);
    }
  } catch {
    // localStorage unavailable — nothing to purge.
  }
};

purgeUntrustedSession();

export const persistLocalUser = (user) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

const clearLocalUser = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
};

const getLocalUser = () => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
};

const mapRole = (value) => {
  const role = String(value || "member").trim().toLowerCase().replace(/\s+/g, "_");

  if (["admin", "administrator", "super_admin"].includes(role)) return "admin";
  if (["employee", "staff"].includes(role)) return "employee";
  
  // Support custom roles dynamically from localStorage
  try {
    const rawRoles = typeof window !== "undefined" ? window.localStorage.getItem("icj_roles") : null;
    const customRoles = rawRoles ? JSON.parse(rawRoles) : {};
    if (customRoles[role]) return role;
  } catch (e) {
    // ignore
  }

  return "member";
};

const AuthService = {
  persistLocalUser(user) {
    persistLocalUser(user);
  },

  getSeedUsers() {
    return getStoredUsers();
  },

  async register(payload = {}) {
    const email = String(payload.email || payload.username || "").trim().toLowerCase();
    const password = String(payload.password || "");
    const fullName = String(payload.fullName || payload.name || "").trim();
    const role = mapRole(payload.role);

    // ── RULE 1: Email अनिवार्य है ──────────────────────────────────────────
    if (!email) {
      throw new Error("Email address is required. Registration cannot proceed without an email.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address (e.g. name@gmail.com).");
    }

    if (!password) {
      throw new Error("Password is required.");
    }

    const validation = PasswordPolicyService.validatePassword(password);
    if (!validation.valid) {
      throw new Error(validation.errors.join(" "));
    }

    const passwordHash = PasswordPolicyService.hashPassword(password);
    const users = getStoredUsers();

    // ── RULE 2: एक Email = एक Registration ─────────────────────────────────
    const existing = users.find(u =>
      String(u.email || "").trim().toLowerCase() === email
    );
    if (existing) {
      throw new Error(
        `This email is already registered (Member ID: ${existing.member_id || existing.id}). Each email can only be used for one account.`
      );
    }

    const birthYearVal = payload.birthYear || payload.birth_year || "";
    if (birthYearVal) {
      const currentYear = new Date().getFullYear();
      const minBirthYear = 1925 + (currentYear - 2026);
      const maxBirthYear = currentYear - 10;
      const yr = Number(birthYearVal);
      if (isNaN(yr) || yr < minBirthYear || yr > maxBirthYear) {
        throw new Error(`Birth Year must be between ${minBirthYear} and ${maxBirthYear}.`);
      }
    }

    // Caller-supplied extras first, so the validated fields below always win.
    // Previously `...payload` came last and could override role/passwordHash/status.
    const { password: _pw, ...safePayload } = payload;

    const newUser = {
      ...safePayload,
      id: `ICJ-USER-${Date.now()}`,
      member_id: `ICJ-USER-${Date.now()}`,
      username: payload.username || email,
      email,
      fullName: fullName || email,
      name: fullName || email,
      role,
      user_type: role,
      member_type: payload.memberType || "individual",
      member_level: payload.member_level || "Basic",
      status: "Active",
      verification_status: "Approved",
      email_verified: true,
      mobile_verified: true,
      ready_for_login: true,
      forcePasswordChange: true,
      passwordHash,
      created_at: new Date().toISOString(),
    };

    const updatedUsers = [newUser, ...users];
    saveStoredUsers(updatedUsers);
    persistLocalUser(newUser);

    PasswordPolicyService.recordPasswordHistory(newUser.id, passwordHash);
    return newUser;
  },

  async login(credentials = {}) {
    const loginIdentifier = String(credentials.email || credentials.username || "").trim().toLowerCase();
    const password = String(credentials.password || "");
    const fallbackRole = mapRole(credentials.role);

    if (!loginIdentifier || !password) {
      throw new Error("Mobile number or Email address and password are required.");
    }

    const inputHash = PasswordPolicyService.hashPassword(password);
    const users = getStoredUsers();

    // Match by Email Address OR Mobile Number OR Username OR Member ID
    const cleanId = loginIdentifier.replace(/\D/g, ""); // digits for mobile check

    const matchedUser = users.find(u => {
      const emailKey = String(u.email || "").toLowerCase();
      const mobKey = String(u.mobile || u.phone || "").replace(/\D/g, "");
      const usernameKey = String(u.username || "").toLowerCase();
      const memberIdKey = String(u.member_id || u.id || "").toLowerCase();

      return (
        emailKey === loginIdentifier ||
        usernameKey === loginIdentifier ||
        memberIdKey === loginIdentifier ||
        (cleanId.length >= 8 && mobKey.endsWith(cleanId))
      );
    });

    // Tier 4 brute-force limiter. It existed in ProductionHardeningService but
    // nothing ever called it, so the 5-attempt lockout did not apply to login.
    ProductionHardeningService.checkRateLimit(loginIdentifier);

    if (!matchedUser) {
      ProductionHardeningService.recordFailedLogin(loginIdentifier);
      throw new Error("Invalid Mobile / Email or Password. Please check and try again.");
    }

    // Verify against the stored hash, or the seed record's literal password.
    // Never accept the username as a password — usernames are listed in the
    // member directory, which made every account trivially accessible.
    const isPasswordValid = Boolean(
      (matchedUser.passwordHash && matchedUser.passwordHash === inputHash) ||
      (matchedUser.password && matchedUser.password === password)
    );

    if (!isPasswordValid) {
      ProductionHardeningService.recordFailedLogin(loginIdentifier);
      throw new Error("Invalid Credentials. Please check your Mobile/Email and Password.");
    }

    ProductionHardeningService.resetLoginLock(loginIdentifier);

    const sessionUser = {
      ...matchedUser,
      role: mapRole(matchedUser.role || fallbackRole),
      forcePasswordChange: Boolean(matchedUser.forcePasswordChange),
    };

    persistLocalUser(sessionUser);
    return sessionUser;
  },

  /**
   * Send Email Verification OTP
   */
  async sendEmailVerificationOTP({ userId, newEmail }) {
    if (!newEmail || !newEmail.includes("@")) {
      throw new Error("Valid email address is required.");
    }
    // Simulated OTP dispatch
    return { success: true, message: `OTP sent to ${newEmail}` };
  },

  /**
   * Verify Email OTP & Update Account Status
   */
  async verifyEmailOTP({ userId, newEmail, otp }) {
    if (otp !== "123456" && otp.length !== 6) {
      return { success: false, message: "Invalid OTP. Enter 123456 for test." };
    }

    const users = getStoredUsers();
    const idx = users.findIndex(u => String(u.id) === String(userId) || String(u.member_id) === String(userId) || u.email === newEmail);

    if (idx !== -1) {
      users[idx].email = newEmail;
      users[idx].emailVerified = true;
      saveStoredUsers(users);

      const currentUser = getLocalUser();
      if (currentUser) {
        currentUser.email = newEmail;
        currentUser.emailVerified = true;
        persistLocalUser(currentUser);
      }
    }

    return { success: true, message: "Email verified successfully!" };
  },

  async changePassword({ userId, currentPassword, newPassword }) {
    if (!userId || !currentPassword || !newPassword) {
      throw new Error("User ID, Current Password, and New Password are required.");
    }

    const users = getStoredUsers();
    const userIndex = users.findIndex(u => String(u.id) === String(userId) || String(u.member_id) === String(userId) || u.username === userId || u.email === userId);

    if (userIndex === -1) {
      throw new Error("User account not found.");
    }

    const user = users[userIndex];
    const currentHash = PasswordPolicyService.hashPassword(currentPassword);

    // Verify current password (username is not an accepted credential)
    const isCurrentValid = Boolean(
      (user.passwordHash && user.passwordHash === currentHash) ||
      (user.password && user.password === currentPassword)
    );

    if (!isCurrentValid) {
      throw new Error("Current password is incorrect.");
    }

    // Validate new password against Policy Engine v3.0
    const validation = PasswordPolicyService.validatePassword(newPassword);
    if (!validation.valid) {
      throw new Error(validation.errors.join(" "));
    }

    // Password History Check
    if (PasswordPolicyService.isPasswordInHistory(user.id, newPassword) || currentPassword === newPassword) {
      throw new Error("New password cannot be the same as your current or previous password.");
    }

    const newHash = PasswordPolicyService.hashPassword(newPassword);

    // Update User Record
    const updatedUser = {
      ...user,
      passwordHash: newHash,
      forcePasswordChange: false,
      updated_at: new Date().toISOString(),
    };

    users[userIndex] = updatedUser;
    saveStoredUsers(users);
    persistLocalUser(updatedUser);

    // Record in History
    PasswordPolicyService.recordPasswordHistory(user.id, newHash);

    return {
      success: true,
      message: "Password changed successfully. Your account is now fully secured.",
      user: updatedUser,
    };
  },

  async logout() {
    clearLocalUser();
    if (canUseSupabaseAuth) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore Supabase signout error fallback
      }
    }
  },

  async getCurrentUser() {
    // Return the stored session only. Never fabricate one: auto-seeding a
    // Super Admin here logged every first-time visitor in as an administrator.
    return getLocalUser();
  },

  async requestRecovery(payload = {}) {
    const email = String(payload.email || payload.username || "").trim().toLowerCase();
    if (!email) {
      throw new Error("Email or Username is required for recovery.");
    }

    return {
      success: true,
      message: "Account recovery request received. An email with recovery instructions has been dispatched.",
    };
  },

  async isLoggedIn() {
    return Boolean(getLocalUser());
  },
};

export default AuthService;
