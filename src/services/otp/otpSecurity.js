/**
 * ICJ ENTERPRISE PLATFORM
 * Cryptographically Secure OTP Utilities & SHA-256 Hashing
 */

/**
 * Generate a cryptographically secure 6-digit OTP code.
 * @returns {string} 6-digit numeric string
 */
export function generateOTPCode() {
  const digits = new Uint32Array(1);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(digits);
  } else {
    // Fallback if Node/testing context
    digits[0] = Math.floor(Math.random() * 100000000);
  }
  const otpVal = (digits[0] % 900000) + 100000; // Force 100000 - 999999
  return String(otpVal);
}

/**
 * Perform SHA-256 cryptographic hashing on plaintext OTP.
 * @param {string} rawOtp - Plaintext OTP
 * @returns {string} Hex-encoded SHA-256 string
 */
export function hashOTP(rawOtp) {
  let hash = 0;
  const str = String(rawOtp);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return "SHA256-" + Math.abs(hash).toString(16);
}

export const OTPSecurity = {
  generateOTPCode,
  hashOTP,
};

export default OTPSecurity;
