/**
 * ICJ ENTERPRISE PLATFORM
 * Main Orchestration Service for Production-Grade Multi-Channel OTP & Authentication MFA
 */
import OTPSecurity from "./otpSecurity.js";
import OTPRateLimiter from "./otpRateLimiter.js";
import OTPAuditService from "./otpAuditService.js";
import OTPProviderRegistry from "./otpProviderRegistry.js";

const ACTIVE_OTPS_KEY = "icj_active_otps_store";

function getActiveOtpsStore() {
  try {
    const raw = localStorage.getItem(ACTIVE_OTPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveActiveOtpsStore(store) {
  localStorage.setItem(ACTIVE_OTPS_KEY, JSON.stringify(store));
}

export const OTPService = {
  /**
   * Request / Send a new OTP
   * @param {string} identifier - Recipient (email or phone)
   * @param {string} channel - Delivery channel ("sms" | "whatsapp" | "email")
   * @param {object} customPolicy - Expiry, attempts overrides
   * @returns {Promise<{success: boolean, message: string, remainingSeconds?: number}>}
   */
  async requestOTP(identifier, channel = "email", customPolicy = {}) {
    const id = String(identifier).trim().toLowerCase();

    // Default policy
    const policy = {
      expirySeconds: customPolicy.expirySeconds || 300, // 5 mins
      cooldownSeconds: customPolicy.cooldownSeconds || 60,
      maxRequests: customPolicy.maxRequests || 5,
      maxAttempts: customPolicy.maxAttempts || 3,
      lockoutDurationMinutes: customPolicy.lockoutDurationMinutes || 15,
    };

    // 1. Rate Limit & Lockout Check
    const limitCheck = OTPRateLimiter.checkRequestLimit(id, policy);
    if (!limitCheck.allowed) {
      return {
        success: false,
        message: limitCheck.reason,
        remainingSeconds: limitCheck.remainingSeconds,
      };
    }

    // 2. Generate secure code
    const plaintextOtp = OTPSecurity.generateOTPCode();
    const hashedOtp = OTPSecurity.hashOTP(plaintextOtp);
    const expiresAt = Date.now() + (policy.expirySeconds * 1000);

    // 3. Invalidate previous OTP for this user (replay protection / invalidation rule)
    const isMockMode = (import.meta.env?.VITE_OTP_MODE === "mock" || localStorage.getItem("icj_otp_mode") === "mock");
    const store = getActiveOtpsStore();
    store[id] = {
      hashedOtp,
      expiresAt,
      attemptsRemaining: policy.maxAttempts,
      createdAt: Date.now(),
      mockPlaintext: isMockMode ? plaintextOtp : undefined,
    };
    saveActiveOtpsStore(store);

    // Record request timestamp and increment rate counter
    OTPRateLimiter.recordRequest(id);

    // 4. Send the payload via the provider registry
    const sendResult = await OTPProviderRegistry.sendThroughChannel(channel, id, plaintextOtp);

    // Clean payload of raw OTP before logging
    OTPAuditService.logEvent("OTP_REQUEST", {
      identifier: id,
      channel,
      deliverySuccess: sendResult.success,
      providerUsed: sendResult.providerUsed || "none",
      warning: sendResult.warning || undefined,
      error: sendResult.error || undefined,
    });

    if (!sendResult.success) {
      return {
        success: false,
        message: "Failed to deliver security code. Please try again later.",
      };
    }

    return {
      success: true,
      message: "OTP request processed.",
    };
  },

  /**
   * Verify an incoming OTP.
   * @param {string} identifier - Recipient (email or phone)
   * @param {string} userInputOtp - Plaintext code submitted by user
   * @param {object} customPolicy - Lockout policy
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async verifyOTP(identifier, userInputOtp, customPolicy = {}) {
    const id = String(identifier).trim().toLowerCase();
    const cleanInput = String(userInputOtp || "").trim();

    // Verification attempt rate limits check
    const limitCheck = OTPRateLimiter.checkVerificationLimit(id, customPolicy);
    if (!limitCheck.allowed) {
      return { success: false, message: limitCheck.reason };
    }

    const store = getActiveOtpsStore();
    const otpRecord = store[id];

    if (!otpRecord) {
      OTPRateLimiter.recordVerificationFailure(id);
      OTPAuditService.logEvent("OTP_VERIFY_FAILED", { identifier: id, reason: "No active record" });
      return { success: false, message: "Invalid or expired security code." };
    }

    // 1. Expiration check
    if (Date.now() > otpRecord.expiresAt) {
      delete store[id];
      saveActiveOtpsStore(store);
      OTPRateLimiter.recordVerificationFailure(id);
      OTPAuditService.logEvent("OTP_VERIFY_FAILED", { identifier: id, reason: "OTP expired" });
      return { success: false, message: "Invalid or expired security code." };
    }

    // 2. Attempts remaining check
    if (otpRecord.attemptsRemaining <= 0) {
      delete store[id];
      saveActiveOtpsStore(store);
      OTPRateLimiter.recordVerificationFailure(id);
      OTPAuditService.logEvent("OTP_VERIFY_FAILED", { identifier: id, reason: "Max attempts exceeded" });
      return { success: false, message: "Invalid or expired security code." };
    }

    // Hash the input code to verify against stored SHA-256 hash (never compare or store raw)
    const hashedInput = OTPSecurity.hashOTP(cleanInput);

    if (otpRecord.hashedOtp !== hashedInput) {
      otpRecord.attemptsRemaining -= 1;
      store[id] = otpRecord;
      saveActiveOtpsStore(store);

      OTPRateLimiter.recordVerificationFailure(id);
      OTPAuditService.logEvent("OTP_VERIFY_FAILED", {
        identifier: id,
        reason: "Mismatch",
        attemptsRemaining: otpRecord.attemptsRemaining,
      });

      if (otpRecord.attemptsRemaining <= 0) {
        delete store[id];
        saveActiveOtpsStore(store);
        return { success: false, message: "Invalid or expired security code." };
      }

      return {
        success: false,
        message: `Invalid security code. ${otpRecord.attemptsRemaining} attempts remaining.`,
      };
    }

    // 3. Success! Clear limits and delete record immediately (replay protection / single use)
    delete store[id];
    saveActiveOtpsStore(store);
    OTPRateLimiter.resetLimits(id);

    OTPAuditService.logEvent("OTP_VERIFY_SUCCESS", { identifier: id });
    return { success: true, message: "Verification successful." };
  },

  /**
   * Helper test hook to get active mock OTPs (testing only)
   */
  getTestOTP(identifier) {
    const isMockMode = (import.meta.env?.VITE_OTP_MODE === "mock" || localStorage.getItem("icj_otp_mode") === "mock");
    if (isMockMode) {
      const store = getActiveOtpsStore();
      const id = String(identifier).trim().toLowerCase();
      return store[id]?.mockPlaintext || null;
    }
    return null;
  },
};

export default OTPService;
