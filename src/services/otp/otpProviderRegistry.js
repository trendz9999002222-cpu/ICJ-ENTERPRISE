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
import EnvConfigManager from "../envConfigManager.js";

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
      return { success: false, error: res.error || "SMTP delivery failed." };
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

    // Extract keys from APIKeyVault, InfraService, and EnvConfigManager
    const vaultRec = APIKeyVault.getKeyRecord(this.getVaultId(providerId)) || {};

    let infraConfig = {};
    try {
      const rawInfra = localStorage.getItem("icj_infra_providers");
      if (rawInfra) {
        const parsed = JSON.parse(rawInfra);
        infraConfig = parsed?.[providerId.toLowerCase()]?.config || {};
      }
    } catch {}

    const envHost = EnvConfigManager.getEnvVar("SMTP_HOST", "") || import.meta.env?.VITE_SMTP_HOST || "";
    const envPort = EnvConfigManager.getEnvVar("SMTP_PORT", "") || import.meta.env?.VITE_SMTP_PORT || "587";
    const envUser = EnvConfigManager.getEnvVar("SMTP_USER", "") || import.meta.env?.VITE_SMTP_USER || "";
    const envPass = EnvConfigManager.getEnvVar("SMTP_PASS", "") || EnvConfigManager.getEnvVar("SMTP_PASSWORD", "") || import.meta.env?.VITE_SMTP_PASS || import.meta.env?.VITE_SMTP_PASSWORD || import.meta.env?.VITE_BREVO_API_KEY || "";
    const envFrom = EnvConfigManager.getEnvVar("SMTP_FROM", "") || import.meta.env?.VITE_SMTP_FROM || "";

    const adapterConfig = {
      mode: isMockMode ? "mock" : "production",
      host: infraConfig.host || envHost || vaultRec.keyId || "smtp-relay.brevo.com",
      port: infraConfig.port || envPort || "587",
      username: infraConfig.username || envUser || vaultRec.keyId || "",
      password: infraConfig.password || envPass || vaultRec.keySecret || "",
      apiKey: infraConfig.password || envPass || vaultRec.keySecret || vaultRec.keyId || import.meta.env?.[`VITE_${providerId.toUpperCase()}_API_KEY`] || "",
      apiToken: vaultRec.keySecret || import.meta.env?.[`VITE_${providerId.toUpperCase()}_API_TOKEN`] || "",
      from: infraConfig.from || envFrom || infraConfig.username || envUser || "noreply@icj.gov",
      tls: infraConfig.tls !== false,
      phoneNumberId: vaultRec.keyId || import.meta.env?.[`VITE_${providerId.toUpperCase()}_PHONE_NUMBER_ID`] || "",
    };

    // If no real credentials configured at all, fallback to mock mode
    if (!adapterConfig.apiKey && !adapterConfig.apiToken && !adapterConfig.password && !adapterConfig.host) {
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
