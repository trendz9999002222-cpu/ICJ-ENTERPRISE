/**
 * ICJ ENTERPRISE PLATFORM
 * OTP Pluggable Provider Registry & Routing Engine
 */
import TwoFactorProvider from "./providers/twoFactorProvider.js";
import Fast2SMSProvider from "./providers/fast2smsProvider.js";
import WhatsAppProvider from "./providers/whatsappProvider.js";
import SMTPProvider from "./providers/smtpProvider.js";
import OTPAuditService from "./otpAuditService.js";
import APIKeyVault from "../apiKeyVault.js";

const providers = {
  "2factor": new TwoFactorProvider(),
  "fast2sms": new Fast2SMSProvider(),
  "whatsapp": new WhatsAppProvider(),
  "smtp": new SMTPProvider(),
};

export const OTPProviderRegistry = {
  /**
   * Send code via a specific channel with primary/fallback routing.
   * @param {string} channel - "sms" | "whatsapp" | "email"
   * @param {string} to - recipient address/phone
   * @param {string} otpCode - plaintext OTP
   * @returns {Promise<{success: boolean, providerUsed: string, messageId?: string, error?: string}>}
   */
  async sendThroughChannel(channel, to, otpCode) {
    const isMockMode = (import.meta.env?.VITE_OTP_MODE === "mock" || localStorage.getItem("icj_otp_mode") === "mock");

    // Fetch governance config from localStorage or defaults
    const config = this.getProviderConfig();

    if (channel === "sms") {
      const primary = config.smsPrimary || "2factor";
      const fallback = config.smsFallback || "fast2sms";

      return this.sendWithFallback(primary, fallback, to, otpCode, isMockMode);
    }

    if (channel === "whatsapp") {
      const primary = "whatsapp";
      // Fallback is SMS channel
      const res = await this.sendDirect(primary, to, otpCode, isMockMode);
      if (res.success) {
        return { success: true, providerUsed: primary, messageId: res.messageId };
      }

      OTPAuditService.logEvent("FALLBACK_TRIGGERED", {
        channel: "whatsapp",
        failedProvider: primary,
        fallbackToChannel: "sms",
        error: res.error,
      });

      // Try SMS primary
      const smsRes = await this.sendThroughChannel("sms", to, otpCode);
      return smsRes;
    }

    if (channel === "email") {
      const primary = "smtp";
      const res = await this.sendDirect(primary, to, otpCode, isMockMode);
      if (res.success) {
        return { success: true, providerUsed: primary, messageId: res.messageId };
      }

      OTPAuditService.logEvent("EMAIL_PROVIDER_FAILED", {
        provider: primary,
        error: res.error,
      });
      return { success: false, error: res.error || "SMTP failed" };
    }

    return { success: false, error: `Invalid channel: ${channel}` };
  },

  /**
   * Helper to send with fallback within a channel.
   */
  async sendWithFallback(primaryId, fallbackId, to, otpCode, isMockMode) {
    const resPrimary = await this.sendDirect(primaryId, to, otpCode, isMockMode);
    if (resPrimary.success) {
      return { success: true, providerUsed: primaryId, messageId: resPrimary.messageId };
    }

    // Primary failed, log and attempt fallback
    OTPAuditService.logEvent("FALLBACK_TRIGGERED", {
      failedProvider: primaryId,
      fallbackProvider: fallbackId,
      error: resPrimary.error,
    });

    const resFallback = await this.sendDirect(fallbackId, to, otpCode, isMockMode);
    if (resFallback.success) {
      return {
        success: true,
        providerUsed: fallbackId,
        messageId: resFallback.messageId,
        warning: `Primary provider ${primaryId} failed. Delivered via fallback ${fallbackId}.`,
      };
    }

    return {
      success: false,
      error: `All delivery providers failed. Primary error: ${resPrimary.error}. Fallback error: ${resFallback.error}`,
    };
  },

  /**
   * Direct invocation of a specific provider.
   */
  async sendDirect(providerId, to, otpCode, isMockMode) {
    const adapter = providers[providerId.toLowerCase()];
    if (!adapter) {
      return { success: false, error: `Provider adapter ${providerId} not found.` };
    }

    // Extract keys from APIKeyVault or process.env configuration
    const vaultRec = APIKeyVault.getKeyRecord(this.getVaultId(providerId)) || {};

    const adapterConfig = {
      mode: isMockMode ? "mock" : "production",
      apiKey: vaultRec.keyId || import.meta.env?.[`VITE_${providerId.toUpperCase()}_API_KEY`] || "",
      apiToken: vaultRec.keySecret || import.meta.env?.[`VITE_${providerId.toUpperCase()}_API_TOKEN`] || "",
      phoneNumberId: vaultRec.keyId || import.meta.env?.[`VITE_${providerId.toUpperCase()}_PHONE_NUMBER_ID`] || "",
      host: vaultRec.keyId || import.meta.env?.VITE_SMTP_HOST || "",
    };

    // If key not configured, fall back automatically to mock mode
    if (!adapterConfig.apiKey && !adapterConfig.apiToken && !adapterConfig.host) {
      adapterConfig.mode = "mock";
    }

    try {
      const res = await adapter.send(to, otpCode, adapterConfig);
      // Track request analytics for health check dashboard
      this.updateProviderHealth(providerId, res.success, res.error);
      return res;
    } catch (e) {
      this.updateProviderHealth(providerId, false, e.message);
      return { success: false, error: e.message };
    }
  },

  getVaultId(providerId) {
    const map = {
      "2factor": "sms",
      "fast2sms": "sms",
      "whatsapp": "whatsapp",
      "smtp": "smtp",
    };
    return map[providerId.toLowerCase()] || providerId;
  },

  getProviderConfig() {
    try {
      const raw = localStorage.getItem("icj_otp_governance_config");
      return raw ? JSON.parse(raw) : {
        smsPrimary: "2factor",
        smsFallback: "fast2sms",
        whatsappPrimary: "whatsapp",
        whatsappFallback: "sms",
        emailPrimary: "smtp",
      };
    } catch {
      return {
        smsPrimary: "2factor",
        smsFallback: "fast2sms",
        whatsappPrimary: "whatsapp",
        whatsappFallback: "sms",
        emailPrimary: "smtp",
      };
    }
  },

  updateProviderHealth(providerId, success, errorMsg) {
    try {
      const healthKey = "icj_otp_providers_health";
      const raw = localStorage.getItem(healthKey);
      const data = raw ? JSON.parse(raw) : {};

      const record = data[providerId] || {
        health: "unknown",
        lastSuccess: null,
        lastFailure: null,
        failureCount: 0,
        successCount: 0,
      };

      if (success) {
        record.lastSuccess = new Date().toISOString();
        record.failureCount = 0;
        record.successCount += 1;
        record.health = "healthy";
      } else {
        record.lastFailure = new Date().toISOString();
        record.failureCount += 1;
        record.health = record.failureCount >= 3 ? "degraded" : "unhealthy";
        record.lastError = errorMsg;
      }

      data[providerId] = record;
      localStorage.setItem(healthKey, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to update health metrics", e);
    }
  },
};

export default OTPProviderRegistry;
