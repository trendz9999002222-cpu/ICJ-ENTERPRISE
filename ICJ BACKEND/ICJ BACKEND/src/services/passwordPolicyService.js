// ICJ ENTERPRISE PLATFORM — ENTERPRISE PASSWORD POLICY ENGINE V3.0
// Single Source of Truth for Password Validation, Configurable Policies, SHA-256 Hashing & History

const POLICY_STORAGE_KEY = "icj_password_policy_config";
const HISTORY_STORAGE_KEY = "icj_password_history";

export const DEFAULT_PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireAlphabet: false,
  requireNumber: false,
  requireSpecialChar: false,
  passwordExpiryDays: 999999,
  failedLoginLockout: false,
  maxLoginAttempts: 5,
  forcePasswordChange: false,
  passwordHistoryCount: 5,
};

/**
 * Generate standard default password for member:
 * First 3 letters of name (TitleCase) + 12345 (Total 8 characters)
 * e.g., "Rahul Sharma" -> "Rah12345", "Amit" -> "Ami12345"
 */
export function generateMemberDefaultPassword(fullName = "Member") {
  const clean = String(fullName || "Member").replace(/[^a-zA-Z0-9]/g, "");
  let prefix = clean.slice(0, 3);
  if (prefix.length === 0) prefix = "Mem";
  else if (prefix.length === 1) prefix = `${prefix}00`;
  else if (prefix.length === 2) prefix = `${prefix}0`;
  
  // TitleCase: First letter uppercase, rest lowercase if letters
  prefix = prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
  return `${prefix}12345`;
}

// Synchronous SHA-256 string hash implementation for fast, reliable client/server execution
export function hashPasswordSync(text = "") {
  const str = String(text);
  if (str.length === 0) return "0";
  
  // Custom SHA-256 bitwise implementation
  function rotateRight(n, x) {
    return (x >>> n) | (x << (32 - n));
  }

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 128) bytes.push(code);
    else if (code < 2048) {
      bytes.push(192 | (code >> 6), 128 | (code & 63));
    } else {
      bytes.push(224 | (code >> 12), 128 | ((code >> 6) & 63), 128 | (code & 63));
    }
  }

  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) bytes.push(0);

  for (let i = 7; i >= 0; i--) {
    bytes.push((bitLen >>> (i * 8)) & 0xff);
  }

  for (let i = 0; i < bytes.length; i += 64) {
    const w = new Array(64);
    for (let j = 0; j < 16; j++) {
      w[j] = (bytes[i + j * 4] << 24) | (bytes[i + j * 4 + 1] << 16) | (bytes[i + j * 4 + 2] << 8) | bytes[i + j * 4 + 3];
    }
    for (let j = 16; j < 64; j++) {
      const s0 = rotateRight(7, w[j - 15]) ^ rotateRight(18, w[j - 15]) ^ (w[j - 15] >>> 3);
      const s1 = rotateRight(17, w[j - 2]) ^ rotateRight(19, w[j - 2]) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let [a, b, c, d, e, f, g, h] = H;

    for (let j = 0; j < 64; j++) {
      const S1 = rotateRight(6, e) ^ rotateRight(11, e) ^ rotateRight(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[j] + w[j]) | 0;
      const S0 = rotateRight(2, a) ^ rotateRight(13, a) ^ rotateRight(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
    H[5] = (H[5] + f) | 0;
    H[6] = (H[6] + g) | 0;
    H[7] = (H[7] + h) | 0;
  }

  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

export const PasswordPolicyService = {
  getConfig() {
    if (typeof window === "undefined") return DEFAULT_PASSWORD_POLICY;
    try {
      const raw = window.localStorage.getItem(POLICY_STORAGE_KEY);
      return raw ? { ...DEFAULT_PASSWORD_POLICY, ...JSON.parse(raw) } : DEFAULT_PASSWORD_POLICY;
    } catch {
      return DEFAULT_PASSWORD_POLICY;
    }
  },

  saveConfig(newConfig) {
    const updated = { ...this.getConfig(), ...newConfig };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  },

  validatePassword(password = "", customConfig = null) {
    const config = customConfig || this.getConfig();
    const errors = [];
    const pwd = String(password);

    if (pwd.trim().length === 0) {
      errors.push("Password cannot be empty or contain only spaces.");
    } else if (pwd !== pwd.trim()) {
      errors.push("Password cannot start or end with spaces.");
    }

    if (pwd.length < config.minLength) {
      errors.push(`Password must be at least ${config.minLength} characters long.`);
    }

    if (config.maxLength && pwd.length > config.maxLength) {
      errors.push(`Password cannot exceed ${config.maxLength} characters.`);
    }

    if (config.requireAlphabet && !/[a-zA-Z]/.test(pwd)) {
      errors.push("Password must contain at least one alphabet character (A-Z or a-z).");
    }

    if (config.requireNumber && !/[0-9]/.test(pwd)) {
      errors.push("Password must contain at least one numeric digit (0-9).");
    }

    if (config.requireSpecialChar && !/[!@#$%^&*()_+\-=[\]{}|;:,.<>?/]/.test(pwd)) {
      errors.push("Password must contain at least one special character (e.g. !@#$%^&*).");
    }

    const isValid = errors.length === 0;
    return {
      valid: isValid,
      isValid: isValid,
      errors,
    };
  },

  validate(password = "", customConfig = null) {
    return this.validatePassword(password, customConfig);
  },

  hashPassword(plainText = "") {
    return hashPasswordSync(plainText);
  },

  getPasswordHistory(userId) {
    if (typeof window === "undefined" || !userId) return [];
    try {
      const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      const allHistory = raw ? JSON.parse(raw) : {};
      return allHistory[userId] || [];
    } catch {
      return [];
    }
  },

  recordPasswordHistory(userId, passwordHash) {
    if (typeof window === "undefined" || !userId || !passwordHash) return;
    try {
      const config = this.getConfig();
      const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      const allHistory = raw ? JSON.parse(raw) : {};
      const userHistory = allHistory[userId] || [];

      // Prepend new hash & keep up to passwordHistoryCount
      const nextHistory = [passwordHash, ...userHistory.filter(h => h !== passwordHash)].slice(0, config.passwordHistoryCount || 5);
      allHistory[userId] = nextHistory;
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(allHistory));
    } catch (err) {
      console.warn("Failed to record password history:", err);
    }
  },

  isPasswordInHistory(userId, newPassword) {
    const newHash = this.hashPassword(newPassword);
    const history = this.getPasswordHistory(userId);
    return history.includes(newHash);
  },

  generateMemberDefaultPassword(fullName = "Member") {
    return generateMemberDefaultPassword(fullName);
  },
};

export default PasswordPolicyService;
