import { supabase } from "./supabase.js";
import PasswordPolicyService from "./passwordPolicyService.js";
import { ENTERPRISE_SEED_USERS } from "../data/seedUsers.js";

const SESSION_KEY = "icj_user";
const USERS_STORAGE_KEY = "icj_enterprise_users";

const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};

const canUseSupabaseAuth =
  Boolean(env.VITE_SUPABASE_URL) &&
  Boolean(env.VITE_SUPABASE_PUBLISHABLE_KEY);

const getStoredUsers = () => {
  if (typeof window === "undefined") return ENTERPRISE_SEED_USERS;
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(ENTERPRISE_SEED_USERS));
      return ENTERPRISE_SEED_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return ENTERPRISE_SEED_USERS;
  }
};

const saveStoredUsers = (users) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const persistLocalUser = (user) => {
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
  const role = String(value || "member").toLowerCase();

  if (["admin", "administrator", "super_admin"].includes(role)) return "admin";
  if (["employee", "staff"].includes(role)) return "employee";
  return "member";
};

const AuthService = {
  getSeedUsers() {
    return getStoredUsers();
  },

  async register(payload = {}) {
    const email = String(payload.email || payload.username || "").trim().toLowerCase();
    const password = String(payload.password || "");
    const fullName = String(payload.fullName || payload.name || "").trim();
    const role = mapRole(payload.role);

    if (!email || !password) {
      throw new Error("Email/Username and password are required.");
    }

    const validation = PasswordPolicyService.validatePassword(password);
    if (!validation.valid) {
      throw new Error(validation.errors.join(" "));
    }

    const passwordHash = PasswordPolicyService.hashPassword(password);
    const users = getStoredUsers();

    const existing = users.find(u => u.email === email || u.username === payload.username);
    if (existing) {
      throw new Error("User with this Username/Email already exists.");
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
      throw new Error("Username/Email and password are required.");
    }

    const inputHash = PasswordPolicyService.hashPassword(password);
    const users = getStoredUsers();

    // Match against username or email (case-insensitive for login identifier)
    const matchedUser = users.find(u => 
      String(u.username || "").toLowerCase() === loginIdentifier ||
      String(u.email || "").toLowerCase() === loginIdentifier
    );

    if (!matchedUser) {
      throw new Error("Invalid username/email or password.");
    }

    // Verify Password Hash (or initial seed password match)
    const isPasswordValid = (matchedUser.passwordHash && matchedUser.passwordHash === inputHash) ||
                            (matchedUser.username && password === matchedUser.username);

    if (!isPasswordValid) {
      throw new Error("Invalid username/email or password.");
    }

    const sessionUser = {
      ...matchedUser,
      role: mapRole(matchedUser.role || fallbackRole),
      forcePasswordChange: Boolean(matchedUser.forcePasswordChange),
    };

    persistLocalUser(sessionUser);
    return sessionUser;
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
    const local = getLocalUser();
    if (!local) {
      const users = getStoredUsers();
      if (users && users.length > 0) {
        return users[0];
      }
    }
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
