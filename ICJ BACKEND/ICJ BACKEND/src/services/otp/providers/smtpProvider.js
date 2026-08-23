import BaseProvider from "./baseProvider.js";

/**
 * ICJ ENTERPRISE PLATFORM — PRODUCTION SMTP & BREVO EMAIL GATEWAY PROVIDER
 * Dispatches real-time transactional security OTPs via Brevo API / SMTP Relay.
 */
export class SMTPProvider extends BaseProvider {
  constructor() {
    super("SMTP");
  }

  /**
   * Dispatches transactional OTP email via Brevo Transactional Email Gateway.
   * @param {string} to - Recipient email address
   * @param {string} otp - 6-digit verification security code
   * @param {object} config - Brevo / SMTP configuration parameters
   * @returns {Promise<{success: boolean, messageId?: string, status?: string, error?: string}>}
   */
  async send(to, otp, config = {}) {
    const host = config.host || "smtp-relay.brevo.com";
    const passwordOrApiKey = config.password || config.apiKey || config.apiToken || "";
    // Resolve sender email: Prioritize configured verified sender or Brevo login username
    const fromAddress = (config.from && !config.from.includes("@icj.gov")) 
      ? config.from 
      : (config.username || config.from || "noreply@icj.gov");
    const senderName = config.senderName || "International Consortium of Jurists (ICJ)";

    // Explicit mock mode check
    if (config.mode === "mock") {
      return {
        success: true,
        messageId: `MOCK-SMTP-${Date.now()}`,
        status: "mock_delivered",
      };
    }

    if (!passwordOrApiKey && !host) {
      return {
        success: false,
        error: "SMTP / Brevo credentials not configured in API Gateway.",
      };
    }

    const cleanTo = String(to).trim();

    try {
      const emailPayload = {
        sender: {
          name: senderName,
          email: fromAddress,
        },
        to: [
          {
            email: cleanTo,
          },
        ],
        subject: `ICJ Platform Verification Code: ${otp}`,
        htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>ICJ Account Verification Code</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background-color: #0f172a; padding: 24px 32px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">
        ⚖️ INTERNATIONAL CONSORTIUM OF JURISTS
      </h1>
      <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 12px; letter-spacing: 0.5px;">
        OFFICIAL ENTERPRISE PLATFORM SECURITY DISPATCH
      </p>
    </div>

    <div style="padding: 32px;">
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 1.5;">
        Dear Applicant,
      </p>
      <p style="margin: 0 0 24px 0; font-size: 15px; color: #334155; line-height: 1.5;">
        Thank you for initiating onboarding on the <strong>ICJ Enterprise Legal Platform</strong>. Please use the following 6-digit One-Time Password (OTP) to complete your identity verification:
      </p>

      <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #0f172a; font-family: monospace;">
          ${otp}
        </span>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
        ⏱️ This verification code is valid for <strong>5 minutes</strong> and can only be used once.
      </p>
      <p style="margin: 0; font-size: 13px; color: #dc2626; line-height: 1.5;">
        🔒 For security reasons, never share this code with anyone. ICJ officials and advocates will never ask for your verification code.
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">
        © 2026 International Consortium of Jurists (ICJ). All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`,
      };

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": passwordOrApiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok && (responseData.messageId || responseData.messageIds)) {
        return {
          success: true,
          messageId: responseData.messageId || (responseData.messageIds && responseData.messageIds[0]),
          status: "delivered",
        };
      }

      // If Brevo returned an error code or message
      const errMsg = responseData.message || responseData.error || `Brevo HTTP error (${response.status})`;
      return {
        success: false,
        error: `Brevo SMTP dispatch rejected: ${errMsg}`,
      };
    } catch (err) {
      return {
        success: false,
        error: `Brevo SMTP Gateway connection error: ${err.message}`,
      };
    }
  }
}

export default SMTPProvider;
