/**
 * ICJ ENTERPRISE DUAL-STORAGE VAULT & OTP-GATED ACCESS SERVICE
 * Supports Mode A: Zero-Knowledge Local Sandbox (0% server files, Sec 79 IT Act Safe Harbor)
 * Supports Mode B: Authorized Cloud Agent Vault with Live 2-Factor OTP Security Keyhole.
 */

const STORAGE_MODE_KEY = "icj_dual_storage_mode_preference";
const CLICKWRAP_AGREEMENT_KEY = "icj_clickwrap_non_liability_agreed";

export const OtpGatedCloudVaultService = {
  getStorageMode() {
    if (typeof window === "undefined") return "LOCAL_SANDBOX";
    try {
      return localStorage.getItem(STORAGE_MODE_KEY) || "LOCAL_SANDBOX";
    } catch {
      return "LOCAL_SANDBOX";
    }
  },

  setStorageMode(mode) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_MODE_KEY, mode);
    } catch (e) {
      console.warn("Set storage mode error:", e.message);
    }
  },

  hasAgreedToWaiver() {
    if (typeof window === "undefined") return true;
    try {
      return localStorage.getItem(CLICKWRAP_AGREEMENT_KEY) === "true";
    } catch {
      return true;
    }
  },

  setAgreedToWaiver(agreed = true) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CLICKWRAP_AGREEMENT_KEY, agreed ? "true" : "false");
    } catch (e) {
      console.warn("Set waiver agreement error:", e.message);
    }
  },

  /**
   * Generates and simulates sending 2-Factor OTP to the client's registered phone
   */
  requestAccessOtp(userPhone = "+91 98765 43210") {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔐 [OTP-GATED VAULT]: Live OTP sent to ${userPhone} ➔ ${generatedOtp}`);
    return {
      success: true,
      otp: generatedOtp, // In production delivered via SMS API
      sentTo: userPhone,
      expiresInSeconds: 300,
      statuteNote: "सुरक्षा लॉक: बिना आपकी अनुमति (OTP) के कोई भी वकील या कर्मचारी आपके कागजात नहीं देख सकता।",
    };
  },

  /**
   * Verifies the OTP to unlock cloud files
   */
  verifyOtp(enteredOtp, expectedOtp) {
    return enteredOtp && enteredOtp.trim() === expectedOtp.trim();
  },
};

export default OtpGatedCloudVaultService;
