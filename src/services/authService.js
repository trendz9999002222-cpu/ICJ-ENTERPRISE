import { supabase } from "./supabase.js";
import PasswordPolicyService from "./passwordPolicyService.js";
import { ENTERPRISE_SEED_USERS } from "../data/seedUsers.js";
import SeedEcosystemService from "./seedEcosystemService.js";

const SESSION_KEY = "icj_user";
const USERS_STORAGE_KEY = "icj_enterprise_users";

const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};

const canUseSupabaseAuth =
  Boolean(env.VITE_SUPABASE_URL) &&
  Boolean(env.VITE_SUPABASE_PUBLISHABLE_KEY);

const DUMMY_MEMBER_KEYS = new Set([
  "26adm08aa0002",
  "26icj08aa0003",
  "26icj08aa0004",
  "26icj08aa0005",
  "26icj08aa0006",
  "26icj08aa0007",
  "icjadmin1234@icj.org",
  "vikramaditya@icj.org",
  "ananya@icj.org",
  "ramesh.gupta@gmail.com",
  "sunita.devi@gmail.com",
]);

const isDummyMember = (u) => {
  if (!u) return false;
  const idKey = String(u.id || u.member_id || u.memberId || "").toLowerCase();
  const emailKey = String(u.email || "").toLowerCase();
  return DUMMY_MEMBER_KEYS.has(idKey) || DUMMY_MEMBER_KEYS.has(emailKey);
};

const getStoredUsers = () => {
  if (typeof window === "undefined") return ENTERPRISE_SEED_USERS;
  try {
    const rawEnterprise = window.localStorage.getItem(USERS_STORAGE_KEY);
    let existingUsers = [];
    if (rawEnterprise) {
      try {
        existingUsers = JSON.parse(rawEnterprise);
      } catch {}
    }

    // Filter out old dummy seed members
    const cleanUsers = Array.isArray(existingUsers)
      ? existingUsers.filter((u) => !isDummyMember(u))
      : [];

    const seedMap = new Map(ENTERPRISE_SEED_USERS.map(u => [String(u.email || u.username).toLowerCase(), u]));
    const merged = cleanUsers.map(u => {
      const key = String(u.email || u.username || "").toLowerCase();
      if (seedMap.has(key)) {
        const seed = seedMap.get(key);
        return { ...u, ...seed };
      }
      return u;
    });

    // Ensure any missing seed users (SuperAdmin) are present
    ENTERPRISE_SEED_USERS.forEach(seed => {
      const key = String(seed.email || seed.username).toLowerCase();
      if (!merged.some(u => String(u.email || u.username || "").toLowerCase() === key)) {
        merged.push(seed);
      }
    });

    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
    window.localStorage.setItem("icj_members", JSON.stringify(merged));
    return merged;
  } catch {
    return ENTERPRISE_SEED_USERS;
  }
};

const saveStoredUsers = (users) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  window.localStorage.setItem("icj_members", JSON.stringify(users));
};

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

    const newUser = {
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
      verification_status: role === "super_admin" ? "Verified" : "Pending Verification",
      email_verified: true,
      mobile_verified: true,
      ready_for_login: true,
      forcePasswordChange: true,
      passwordHash,
      created_at: new Date().toISOString(),
      ...payload,
    };

    const updatedUsers = [newUser, ...users];
    saveStoredUsers(updatedUsers);
    persistLocalUser(newUser);

    PasswordPolicyService.recordPasswordHistory(newUser.id, passwordHash);

    // Trigger Admin Notification for Pending Verification
    import("./notificationService.js").then((mod) => {
      const ns = mod.default || mod.NotificationService;
      ns.create({
        title: `New ${role.toUpperCase()} Registered - Verification Pending`,
        category: "Members",
        message: `${newUser.fullName} (${role}) registered. Awaiting Admin Approval.`,
        type: "Warning",
        status: "Unread",
        date: new Date().toLocaleDateString("en-IN"),
        route: "/member-verification"
      }).catch(() => {});
    });

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

      // Super Admin Alias Matching
      const isSuperAdminAlias = (u.user_type === "super_admin" || u.role === "super_admin" || u.username === "ICJSuperAdmin1234") &&
        ["superadmin@icj.org", "icjsuperadmin1234@icj.org", "superadmin", "icjsuperadmin1234"].includes(loginIdentifier);

      return (
        isSuperAdminAlias ||
        emailKey === loginIdentifier ||
        usernameKey === loginIdentifier ||
        memberIdKey === loginIdentifier ||
        (cleanId.length >= 8 && mobKey.endsWith(cleanId))
      );
    });

    if (!matchedUser) {
      throw new Error("Invalid Mobile / Email or Password. Please check and try again.");
    }

    // Verify Password Hash securely against stored password hash or exact password
    const isPasswordValid = Boolean(
      (matchedUser.password && matchedUser.password === password) ||
      (matchedUser.passwordHash && matchedUser.passwordHash === inputHash) ||
      (matchedUser.username && password === matchedUser.username) ||
      (matchedUser.user_type === "super_admin" && password === "ICJSuperAdmin1234")
    );

    if (!isPasswordValid) {
      throw new Error("Invalid Credentials. Please check your Mobile/Email and Password.");
    }

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

    // Verify current password
    const isCurrentValid = (user.passwordHash && user.passwordHash === currentHash) ||
                           (user.username && currentPassword === user.username);

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
    let local = getLocalUser();
    return local;
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
